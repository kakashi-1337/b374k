import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { format, parseISO } from 'date-fns'
import dayjs from 'dayjs'
import {
  Tabs,
  Box,
  Text,
  Button,
  Group,
  Modal,
  TextInput,
  ScrollArea,
  Center,
} from '@mantine/core'
import { Card, DateRange, Table, TextViewMore } from 'components'
import CashbackTransactions from '../CashbackTransaction'
import { useUserContext } from 'hooks'

const CheckNetbankTransaction = () => {
  const [transactionId, setTransactionId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    if (data) {
      setOpened(true)
    }
  }, [data])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        `/api/v2/netbank/transactions/${transactionId}`,
      )
      setData(data)
    } catch (err) {
      alert(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={`Netbank Transaction (${transactionId})`}
      >
        <pre> {JSON.stringify(data, null, 2)} </pre>
      </Modal>
      <Card mb="xl" title="Check Netbank Transaction">
        <Group>
          <TextInput
            placeholder="Input transaction id"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            type="text"
          />
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!transactionId || loading}
          >
            Check
          </Button>
        </Group>
      </Card>
    </>
  )
}

const ManualTransactionMaker = () => {
  const { user } = useUserContext()

  if (user.role !== 'admin') return null // double check
  const [creditToUsername, setCreditToUsername] = useState('')
  const [amountInPHP, setAmountInPHP] = useState('')
  const [unionbankReferenceId, setUnionbankReferenceId] = useState('')

  const handleSubmit = () => {
    if (
      confirm(
        `Are you sure you wish to credit ${amountInPHP} PHP to @${creditToUsername} in relation to their Deposit to the Pouch UnionBank account with the reference ID of ${unionbankReferenceId}?`,
      )
    ) {
      axios
        .post('/api/v0/bridge/transaction/issue-manual-deposit', {
          creditToUsername,
          amountInPHP,
          unionbankReferenceId,
        })
        .then((res) => {
          alert('Success')
        })
        .catch((err) => {
          alert('Error issuing completion. ' + err.response?.data)
        })
    }
  }
  return (
    <Card mb="xl" title="Manually Credit a Deposit">
      <Group>
        <TextInput
          placeholder="username"
          value={creditToUsername}
          onChange={(e) => setCreditToUsername(e.target.value)}
          type="text"
        />
        <TextInput
          placeholder="amount in PHP"
          value={amountInPHP}
          onChange={(e) => setAmountInPHP(e.target.value)}
          type="text"
        />
        <TextInput
          placeholder="Unionbank Reference Id (i.e. UB1234)"
          value={unionbankReferenceId}
          onChange={(e) => setUnionbankReferenceId(e.target.value)}
          type="text"
        />
        <Button onClick={handleSubmit}>Credit Account</Button>
      </Group>
    </Card>
  )
}

export const MoreFeatures = () => {
  const [viewTx, setViewTx] = useState(null)
  const [pendingOnchainTxData, setPendingOnchainTxData] = useState([])
  const [intakeForm, setIntakeForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [txDataError, setTxDataError] = useState(null)

  // For pending-review transaction
  const getPendingOnchainTransactions = () => {
    setLoading(true)
    axios
      .get('/api/v0/bridge/transaction/list?status=pending-review')
      .then((res) => {
        console.log(res.data)
        setPendingOnchainTxData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setTxDataError(err.response?.data?.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    getPendingOnchainTransactions()
    return () => {
      setTxData([])
    }
  }, [])

  const getIntakeForm = async (intakeFormRefId) => {
    try {
      const { data } = await axios.get(
        `/api/v2/intake-form?referenceId=${intakeFormRefId}`,
      )
      if (data) {
        setIntakeForm(data)
      } else {
        alert('Intake form not yet available.')
      }
    } catch (err) {
      console.log(err)
      alert('Failed to retrieve intake form.')
    }
  }

  const handleApprove = (intakeFormRefId) => {
    if (
      window.confirm(
        `Are you sure you wish to approve deposit for intake form id: ${intakeFormRefId}`,
      )
    ) {
      axios
        .patch('/api/v0/bridge/transaction/approve-deposit', {
          intakeFormRefId,
        })
        .then((res) => {
          getPendingOnchainTransactions()
          getTransactions()
        })
        .catch((err) => {
          alert('Error approving on-chain deposit. ' + err.response?.message)
        })
    }
  }

  const handleView = (tx) => setViewTx(tx)

  const dataFormat = (tx) => ({
    id: tx._id,
    status: tx.status,
    sender: tx.sender?.entityIdentifier,
    recipient: tx.recipient?.entityIdentifier,
    amount: `${tx.recipient?.total || tx.sender?.total} ${
      tx.recipient?.currency || tx.sender?.currency
    }`,
    date: tx.updatedAt,
    actions: tx,
  })

  const pendingOnchainTxTableData = useMemo(() => {
    return pendingOnchainTxData.map((tx) => dataFormat(tx), [])
  }, [pendingOnchainTxData])

  const commonColumns = [
    {
      Header: 'Id',
      accessor: 'id',
      Cell: ({ value }) =>
        value ? <TextViewMore text={value} maxLength={8} /> : null,
    },
    {
      Header: 'Status',
      accessor: 'status',
    },
    {
      Header: 'Sender',
      accessor: 'sender',
      Cell: ({ value }) =>
        value ? <TextViewMore text={value} maxLength={16} /> : null,
    },
    {
      Header: 'Recipient',
      accessor: 'recipient',
      Cell: ({ value }) =>
        value ? <TextViewMore text={value} maxLength={16} /> : null,
    },
    {
      Header: 'Amount',
      accessor: 'amount',
    },
    {
      Header: 'Date & Time',
      accessor: 'date',
      Cell: ({ value }) => {
        const parsedDate = parseISO(value)
        return (
          <Box sx={{ width: 120 }}>
            <Text>{format(parsedDate, 'dd MMM yyyy')}</Text>
            <Text size="sm">{format(parsedDate, 'hh:mm aa xxxxx')}</Text>
          </Box>
        )
      },
    },
  ]

  const pendingOnchainColumns = useMemo(
    () => [
      ...commonColumns,
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ value }) => {
          return (
            <Button.Group>
              <Button
                variant="outline"
                onClick={() =>
                  handleApprove(value?.extra_data?.intakeFormRefId)
                }
              >
                Approve
              </Button>
              <Button variant="outline" onClick={() => handleView(value)}>
                View
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  getIntakeForm(value?.extra_data?.intakeFormRefId)
                }
              >
                View Intake Form
              </Button>
            </Button.Group>
          )
        },
      },
    ],
    [],
  )

  // if (loading) return <div className="loader" />
  // if (txDataError !== null) return <div>{txDataError}</div>
  return (
    <Box>
      {txDataError}
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

      <Modal
        size="lg"
        opened={intakeForm}
        onClose={() => setIntakeForm(null)}
        title={`Transaction ${intakeForm?._id}`}
      >
        <ScrollArea type="always">
          {intakeForm ? (
            <Box>
              <Text size="xl" weight="bold">
                Intake Form
              </Text>
              <Text>
                Amount: {intakeForm.amount.value} {intakeForm.amount.currency}
              </Text>
              <Text>Sending Service: {intakeForm.sendingService}</Text>
              <Text>Source of Funds: {intakeForm.sourceOfFunds}</Text>
              <Text>Reason: {intakeForm.reason}</Text>
              <Text>Sender Name: {intakeForm.senderName}</Text>
              <Text>Sender Address: {intakeForm.senderAddress}</Text>
              <Text>Sender Country: {intakeForm.senderCountry}</Text>
              <Text>
                Date Submitted:{' '}
                {dayjs(intakeForm.createdAt).format('MMM, DD YYYY hh:mm A')}
              </Text>
            </Box>
          ) : null}
        </ScrollArea>
      </Modal>
      {/* <CashbackTransactions /> */}
      <CheckNetbankTransaction />
      <ManualTransactionMaker />
      <Card mb="xl" title="On-Chain Deposits for Approval">
        <Table
          data={pendingOnchainTxTableData}
          columns={pendingOnchainColumns}
          striped
          height={300}
          loading={loading}
          pagination={false}
        />
      </Card>
    </Box>
  )
}
