import { useState, useEffect, useMemo, useRef } from 'react'
import {
  TextInput,
  Box,
  Textarea,
  Group,
  Text,
  Notification
} from '@mantine/core'
import {
  IconSearch,
  IconClipboardText,
  IconFileDownload,
  IconExclamationMark
} from '@tabler/icons'
import { CSVLink } from 'react-csv'
import { Button, Table } from 'components'
import commaNumber from 'comma-number'
import roundToPlaces from 'helpers/round-to-places'
import { useBanks } from 'hooks'

const headers = [
  { label: 'Bank Name', key: 'bankName' },
  { label: 'Bank Code (instapay)', key: 'bankCodeInstapay' },
  { label: 'Bank Code (pesonet)', key: 'bankCodePesonet' }
]

const BankAccountBatchTable = ({
  isReadClipboardSupported,
  bankAccountRows,
  setBankAccountRows
}) => {
  const [pasteData, setPasteData] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [bankListData, setBankListData] = useState([])
  const [bankListError, setBankListError] = useState(null)
  const [bankListLoading, setBankListLoading] = useState(false)
  const { banks, loading } = useBanks()
  const csvRef = useRef(null)

  useEffect(() => {
    if (pasteData.length > 0) {
      transformExcelData()
    }
  }, [pasteData])

  const data = useMemo(() => {
    return (
      bankAccountRows.filter((obj) =>
        obj.recipientName.includes(searchQuery)
      ) || []
    )
  }, [bankAccountRows, searchQuery])

  const columns = useMemo(
    () => [
      {
        Header: 'Recipient Name',
        accessor: 'recipientName'
      },
      {
        Header: 'Bank Code',
        accessor: 'bankCode'
      },
      {
        Header: 'Account Number',
        accessor: 'accountNumber'
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ value }) => <Text weight={700}>{commaNumber(value)}</Text>
      }
    ],
    []
  )

  const formatBankList = (data) => {
    return data?.reduce((prev, curr) => {
      return [
        ...prev,
        {
          bankName: curr.bankName,
          bankCodeInstapay: curr.bankCode?.instapay || '',
          bankCodePesonet: curr.bankCode?.pesonet || ''
        }
      ]
    }, [])
  }

  const handleDownloadBankList = async () => {
    if (!bankListData.length && banks.length) {
      setBankListLoading(true)
      try {
        const bankListData = formatBankList(banks)
        setBankListData(bankListData)
        // Used setTimeout because if not, the csv file will only show the headers and the the bank list data
        setTimeout(async () => await csvRef.current.link.click(), 0)
      } catch (e) {
        setBankListError('Downloading bank list failed. Please try again.')
      } finally {
        setBankListLoading(false)
      }
    } else {
      await csvRef.current.link.click()
    }
  }

  const handlePaste = async () => {
    if (isReadClipboardSupported) {
      const text = await navigator.clipboard.readText()
      setPasteData(text)
    }
  }

  const handleReset = () => {
    setPasteData('')
    setBankAccountRows([])
  }

  const transformExcelData = async () => {
    const arr = pasteData.split('\n')
    if (arr[arr.length - 1] === '') arr.pop() // removes the last empty element in the array
    const newArr = arr.map((entry) => {
      const strSplit = entry.replace('\r', '').split('\t')
      const parsedAmount = roundToPlaces(
        Number(strSplit[3]?.replace(/[^0-9.]/g, '')),
        2
      )
      return {
        recipientName: strSplit[0],
        bankCode: strSplit[1],
        accountNumber: strSplit[2],
        amount: parsedAmount
      }
    })
    setBankAccountRows(newArr)
  }

  const exportCSVFilename = `Pouch_Bank_Transfer_List.csv`

  return (
    <>
      {bankListError ? (
        <Notification
          mb="sm"
          icon={<IconExclamationMark stroke={1.5} />}
          color="error"
          title={bankListError}
          onClose={() => setExportError(null)}
        />
      ) : null}
      <Box mb="xl">
        {isReadClipboardSupported ? null : (
          <Group position="apart">
            <Textarea
              size="md"
              value={pasteData}
              placeholder="Paste rows from spreadsheet here"
              maxRows={1}
              disabled={pasteData.length > 0}
              onChange={(e) => setPasteData(e.target.value)}
            />
            <Button
              variant="subtle"
              onClick={handleReset}
              disabled={pasteData.length === 0}
            >
              Reset
            </Button>
          </Group>
        )}
        <Group position="apart">
          <TextInput
            size="md"
            placeholder="Search recipient name"
            icon={<IconSearch />}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={handleDownloadBankList}
            disabled={loading || bankListLoading}
            loading={loading || bankListLoading}
            leftIcon={<IconFileDownload />}
          >
            {loading
              ? 'Loading Bank List'
              : bankListLoading
              ? 'Downloading Bank List'
              : 'Download Bank List'}
          </Button>
          {isReadClipboardSupported ? (
            <Button
              variant="subtle"
              onClick={handlePaste}
              leftIcon={<IconClipboardText />}
            >
              Paste
            </Button>
          ) : null}
        </Group>
      </Box>
      <CSVLink
        ref={csvRef}
        data={bankListData}
        headers={headers}
        filename={exportCSVFilename}
        target="_blank"
      />
      <Table data={data} columns={columns} striped height={500} />
    </>
  )
}

export default BankAccountBatchTable
