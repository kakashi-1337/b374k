import { useEffect, useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { Paper, Button, Box, Group, Text, ActionIcon, Modal, Grid } from '@mantine/core'
import { IconUser, IconBuildingBank, IconTrash } from '@tabler/icons'
import Card from 'components/Card'
import Table from 'components/Table'
import TabButton from 'components/TabButton'
import BackButton from 'components/BackButton'

const PouchContactsTable = ({ user }) => {
  const columns = useMemo(() => [
    {
      Header: 'Username',
      accessor: 'username'
    }
  ], [])

  const data = useMemo(() => {
    return user.contacts
      .filter(({ entityType }) => entityType === 'pouch-user')
      .reduce((prev, curr) => {
        return [...prev, {
          username: curr.entityIdentifier
        }]
      }, [])
  }, [])

  return (
    <Paper withBorder>
      <Table columns={columns} data={data} loading={false} />
    </Paper>
  )
}

const BankRecipientsTable = ({ activeProfileUsername, bankRecipients, loading, setLoading, fetchRecipients, error }) => {
  const [opened, setOpened] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState({})

  const handleDelete = async () => {
    setLoading(true)
    setOpened(false)
    try {
      const res = await axios.delete(`/api/v0/bank/recipients/${selectedRecipient.recipientId}?activeProfileUsername=${activeProfileUsername}`)
      if (res) {
        fetchRecipients()
      }
    } catch (err) {
      alert('Error deleting recipient')
      setLoading(false)
    }
  }

  const columns = useMemo(() => [
    {
      Header: 'Account Name',
      accessor: 'accountName'
    },
    {
      Header: 'Account Number',
      accessor: 'accountNumber'
    },
    {
      Header: 'Bank',
      accessor: 'bankName'
    },
    {
      Header: '',
      accessor: 'deleteButton',
      Cell: ({ value }) => (
        <ActionIcon
          color='error'
          onClick={() => {
            setSelectedRecipient(value)
            setOpened(true)
          }}
        >
          <IconTrash />
        </ActionIcon>
      )
    }
  ], [])

  const data = useMemo(() => {
    return bankRecipients.length > 0
      ? bankRecipients.reduce((prev, curr) => {
        return [...prev, {
          accountName: curr.accountName,
          accountNumber: curr.accountNumber,
          bankName: curr.bankName,
          deleteButton: curr
        }]
      }, [])
      : []
  }, [bankRecipients])

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title='Delete this saved recipient?'
      >
        <Text>You are about to delete this recipient from your contacts</Text>
        <Grid mt='sm'>
          <Grid.Col span={4}>
            <Text weight='bold'>Account Name</Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text>{selectedRecipient.accountName}</Text>
          </Grid.Col>
        </Grid>
        <Grid mt='sm'>
          <Grid.Col span={4}>
            <Text weight='bold'>Account Number</Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text>{selectedRecipient.accountNumber}</Text>
          </Grid.Col>
        </Grid>
        <Grid mt='sm'>
          <Grid.Col span={4}>
            <Text weight='bold'>Bank</Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text>{selectedRecipient.bankName}</Text>
          </Grid.Col>
        </Grid>
        <Group mt='xl' sx={{ justifyContent: 'flex-end' }}>
          <Button variant='outline' onClick={() => setOpened(false)}>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </Group>
      </Modal>
      <Paper withBorder>
        <Table columns={columns} data={data} loading={loading} />
      </Paper>
      {bankRecipients.length > 0 ? null : <Text mt='sm'>{error}</Text>}
    </>
  )
}

const ManageContacts = ({ user }) => {
  const history = useHistory()
  const [activeTab, setActiveTab] = useState(0)
  const [bankRecipients, setBankRecipients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecipients()
    return () => {
      setBankRecipients([])
    }
  }, [])

  const fetchRecipients = () => {
    setLoading(true)
    axios.get(`/api/v0/bank/recipients?activeProfileUsername=${user.username}`)
      .then((res) => {
        setBankRecipients(res.data)
        setError(null)
        setLoading(false)
      })
      .catch(() => {
        setError('Error fetching bank recipients')
        setLoading(false)
      })
  }

  const handleBack = () => history.replace('/dashboard')

  const handleAddPouchContact = () => {
    history.push('/dashboard/manage-contacts/add-pouch-contact')
  }

  const handleAddBankRecipient = () => {
    history.push('/dashboard/manage-contacts/add-bank-recipient')
  }

  return (
    <>
      <BackButton onClick={handleBack} />
      <Card mt='xs' title='Manage Contacts'>
        <Box mb='md' sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Group>
            <TabButton active={activeTab === 0} onClick={() => setActiveTab(0)} icon={<IconUser />}>Pouch Contacts</TabButton>
            <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)} icon={<IconBuildingBank />}>Bank Recipients</TabButton>
          </Group>
          {activeTab === 0 ? <Button variant='subtle' onClick={handleAddPouchContact}>+ New Contact</Button> : null}
          {activeTab === 1 ? <Button variant='subtle' onClick={handleAddBankRecipient}>+ Add Bank Recipient</Button> : null}
        </Box>
        {activeTab === 0 ? <PouchContactsTable user={user} /> : null}
        {activeTab === 1
          ? <BankRecipientsTable
            activeProfileUsername={user.username}
            bankRecipients={bankRecipients}
            loading={loading}
            setLoading={setLoading}
            fetchRecipients={fetchRecipients}
            error={error}
          />
          : null}
      </Card>
    </>
  )
}

export default ManageContacts
