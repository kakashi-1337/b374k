import React, { useState, useEffect, useMemo, useRef } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { CSVLink } from 'react-csv'
import {
  createStyles,
  Box,
  Text,
  Group,
  Notification,
  Modal,
  ScrollArea,
} from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { Card, Table, Button, TextViewMore } from 'components'
import { DocumentDownload } from 'iconsax-react'
import { IconExclamationMark, IconCalendarEvent } from '@tabler/icons'
import {
  getSender,
  getRecipient,
  getTotal,
  getAmount,
  getFee,
} from 'helpers/transactions-table-helpers'
import { useUserContext } from 'hooks'

const MAX_LENGTH = 17

const headers = [
  { label: 'Date & Time', key: 'date' },
  { label: 'Transaction Type', key: 'type' },
  { label: 'Sender', key: 'sender' },
  { label: 'Recipient', key: 'recipient' },
  { label: 'Memo', key: 'memo' },
  { label: 'Amount', key: 'amount' },
  { label: 'Fee', key: 'fee' },
  { label: 'Total', key: 'total' },
  { label: 'Status', key: 'status' },
]
const dateFormat = 'DD/MMM/YYYY'

const Transactions = ({ isBridge = false, type }) => {
  const { username: defaultUsername } = useParams()
  const { user } = useUserContext()
  const { classes } = useStyles()
  const [tableData, setTableData] = useState([])
  const [totalTx, setTotalTx] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageNum, setPageNum] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)
  const [exportData, setExportData] = useState([])
  const [exportError, setExportError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const csvRef = useRef(null)
  const [viewTx, setViewTx] = useState(null)

  const username = isBridge ? '' : defaultUsername || user.username

  const columns = useMemo(() => {
    const _columns = [
      {
        Header: 'Date & Time',
        accessor: 'date',
        Cell: ({ value }) => {
          const parsedDate = parseISO(value)
          return (
            <Box sx={{ width: 120 }}>
              <Text>{format(parsedDate, 'dd MMM yyyy')}</Text>
              <Text size="sm" weight={400}>
                {format(parsedDate, 'hh:mm aa xxxxx')}
              </Text>
            </Box>
          )
        },
      },
      {
        Header: 'Transaction Type',
        accessor: 'type',
      },
      {
        Header: 'Sender',
        accessor: 'sender',
        Cell: ({ value }) =>
          value ? <TextViewMore text={value} maxLength={MAX_LENGTH} /> : null,
      },
      {
        Header: 'Recipient',
        accessor: 'recipient',
        Cell: ({ value }) =>
          value ? <TextViewMore text={value} maxLength={MAX_LENGTH} /> : null,
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ value }) => (
          <Box>
            <Text
              weight={700}
              className={
                value.status === 'completed' &&
                value.entityIdentifier === username
                  ? classes.addedAmount
                  : null
              }
            >
              {value.amount}
            </Text>
            {value.fee ? (
              <Text weight={600} size="xs">
                Fee: {value.fee}
              </Text>
            ) : null}
          </Box>
        ),
      },
      {
        Header: 'Memo',
        accessor: 'memo',
        Cell: ({ value }) =>
          value ? <TextViewMore text={value} maxLength={12} /> : null,
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <Text className={classes[value]} transform="uppercase" weight={700}>
            {value}
          </Text>
        ),
      },
    ]
    if (['admin'].includes(user.role)) {
      _columns.push({
        Header: 'Actions',
        accessor: 'originalTransaction',
        Cell: ({ value }) => (
          <Button variant="transparent" onClick={() => handleView(value)}>
            View
          </Button>
        ),
      })
    }
    return _columns
  }, [])

  const handleView = (tx) => setViewTx(tx)

  const data = useMemo(() => {
    return tableData.reduce((prev, curr) => {
      let row = {
        date: curr.transactionDate,
        type: curr.transactionType,
        sender: getSender(curr, username) ?? '',
        recipient: getRecipient(curr, username) ?? '',
        amount: {
          amount: getAmount(curr, username, curr.currency),
          fee: getFee(curr, curr.currency),
          status: curr.status,
          entityIdentifier: curr.recipientName,
        },
        memo: curr.memo,
        status: curr.status,
      }
      if (['admin'].includes(user.role)) {
        row = {
          ...row,
          originalTransaction: curr.originalTransaction,
        }
      }
      return [...prev, row]
    }, [])
  }, [tableData])

  useEffect(() => {
    fetchTransactions(pageNum, rowsPerPage)
  }, [pageNum, rowsPerPage, type])

  const fetchTransactions = async (page, limit) => {
    const data = await getTransactions(page, limit)
    setTableData(data.results)
    setTotalTx(data.total)
    setTotalPages(data.totalPages)
  }

  const getTransactions = async (page, limit) => {
    setLoading(true)
    try {
      let url = `/api/v0/transactions?activeProfileUsername=${username}`

      if (['admin'].includes(user.role)) {
        url = `/api/v3/bridge/transactions?username=${username}`
        if (type) {
          url += `&type=${type}`
        }
      }

      if (page) url += `&page=${page}`
      if (fromDate) url += `&fromDate=${new Date(fromDate).toISOString()}`
      if (toDate) url += `&toDate=${new Date(toDate).toISOString()}`
      if (limit) url += `&limit=${limit}`
      const res = await axios.get(url)
      return ['admin'].includes(user.role)
        ? {
            limit: res.data.metadata.limit,
            page: res.data.metadata.page,
            results: res.data.data,
            total: res.data.metadata.limit,
            totalPages: res.data.metadata.pages,
          }
        : res.data
    } catch (err) {
      console.error(err)
      setExportLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyDateRange = async () => {
    if (pageNum !== 1) {
      setPageNum(1)
    } else {
      fetchTransactions(1)
    }
  }

  const formatExportData = (data) => {
    return data?.reduce((prev, curr) => {
      return [
        ...prev,
        {
          date: format(
            parseISO(curr.transactionDate),
            'dd MMM yyyy hh:mm aa xxxxx',
          ),
          txType: curr.transactionType,
          sender: getSender(curr, username) ?? '',
          recipient: getRecipient(curr, username) ?? '',
          memo: curr?.memo || '',
          total: getTotal(curr, username, curr.currency),
          amount: getAmount(curr, username, curr.currency),
          fee: getFee(curr, curr.currency),
          status: curr.status.replace(/_/g, ' '),
        },
      ]
    }, [])
  }

  const handleDownloadCSV = async () => {
    setExportLoading(true)
    const MAX_LIMIT = 50
    try {
      const mapAllTransactions = []
      for (let i = 1; i <= totalPages; i++) {
        const txData = async (page) => {
          const data = await getTransactions(page, MAX_LIMIT)
          return data.results
        }
        mapAllTransactions.push(txData(i))
      }
      const allTransactions = await Promise.all(mapAllTransactions)
      const transformedTransactions = allTransactions.reduce((prev, curr) => {
        return [...prev, ...curr]
      }, [])
      const exportData = formatExportData(transformedTransactions)
      setExportData(exportData)
      setExportLoading(false)
      await csvRef.current.link.click()
    } catch (e) {
      setExportError('Exporting CSV file failed.')
      setExportLoading(false)
    }
  }

  const handleDownloadCustomBillerTxns = async () => {
    try {
      setExportLoading(true)
      const res = await axios.get('/api/v3/custom/transactions', {
        responseType: 'blob',
      })

      const fileName = `Pouch Biller Transactions_${format(
        new Date(),
        'ddMMMyyyy',
      )}_${username}.csv`

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()

      // Cleanup
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setExportError('Exporting CSV file failed.')
    } finally {
      setExportLoading(false)
    }
  }

  const exportCSVFilename = `Pouch_${format(
    new Date(),
    'dd MMM yyyy',
  )}_${username}.csv`

  return (
    <>
      <Modal
        size="lg"
        opened={viewTx}
        onClose={() => setViewTx(null)}
        title={`Transaction ${viewTx?._id}`}
      >
        <ScrollArea type="always">
          <Text size="lg">
            <pre>{JSON.stringify(viewTx, null, 2)}</pre>
          </Text>
        </ScrollArea>
      </Modal>
      {exportLoading ? (
        <Notification mb="sm" loading title="Exporting CSV file" disallowClose>
          Please wait while we are preparing your CSV file
        </Notification>
      ) : null}
      {exportError ? (
        <Notification
          mb="sm"
          icon={<IconExclamationMark stroke={1.5} />}
          color="error"
          title={exportError}
          onClose={() => setExportError(null)}
        />
      ) : null}
      {['admin', 'biller'].includes(user.role) ? (
        <Card mb="md">
          <Group position="apart">
            <Text fw={500}>
              Download your biller transactions for the past 90 days
            </Text>
            <Button
              my="xs"
              variant="subtle"
              leftIcon={<DocumentDownload />}
              onClick={handleDownloadCustomBillerTxns}
              disabled={loading}
            >
              Download CSV
            </Button>
          </Group>
        </Card>
      ) : null}
      <Card
        title={
          <Box>
            {defaultUsername ? (
              <Text fw={700} mb="sm">
                Transactions for {defaultUsername}
              </Text>
            ) : null}
            <Group position="apart">
              <Group spacing="xs">
                <Group spacing="xs">
                  <Text>From</Text>
                  <DatePicker
                    value={fromDate}
                    onChange={setFromDate}
                    placeholder={dateFormat}
                    inputFormat={dateFormat}
                    icon={<IconCalendarEvent stroke={1.5} />}
                    maxDate={toDate}
                  />
                </Group>
                <Group spacing="xs">
                  <Text>To</Text>
                  <DatePicker
                    value={toDate}
                    onChange={setToDate}
                    placeholder={dateFormat}
                    inputFormat={dateFormat}
                    icon={<IconCalendarEvent stroke={1.5} />}
                    minDate={fromDate}
                  />
                </Group>
                <Button onClick={handleApplyDateRange} disabled={loading}>
                  Apply
                </Button>
              </Group>
              <Button
                my="xs"
                variant="subtle"
                leftIcon={<DocumentDownload />}
                onClick={handleDownloadCSV}
                disabled={loading}
              >
                Download CSV
              </Button>
            </Group>
          </Box>
        }
      >
        <CSVLink
          ref={csvRef}
          data={exportData}
          headers={headers}
          filename={exportCSVFilename}
          target="_blank"
        />
        <Table
          data={data}
          columns={columns}
          striped
          height={588}
          loading={loading}
          totalPages={totalPages}
          pageNum={pageNum}
          setPageNum={setPageNum}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />
      </Card>
    </>
  )
}

export default Transactions

const useStyles = createStyles((theme) => ({
  addedAmount: {
    color: theme.other.success,
  },
  completed: {
    color: theme.other.success,
  },
  issued: {
    color: theme.other.warning,
  },
  processing: {
    color: theme.other.warning,
  },
  failed: {
    color: theme.other.error,
  },
  refunded: {
    color: theme.other.error,
  },
  cancelled: {
    color: theme.other.error,
  },
}))
