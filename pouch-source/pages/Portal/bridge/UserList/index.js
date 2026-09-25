import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import formatBalance from 'helpers/format-balance'
import Modal from '@mui/material/Modal'
import { IconBeach, IconBuildingStore } from '@tabler/icons'
import {
  Group,
  Text,
  TextInput,
  Modal as MantineModal,
  ScrollArea,
  Tabs,
  Anchor,
  Button,
  Box,
  Chip,
  Select,
  Drawer,
  Checkbox
} from '@mantine/core'
import { Card, Table } from 'components'
import EditModal from './EditModal'

const PAGE_LIMIT = 100
const INITIAL_LIST = [
  {
    name: '🧍 ID Approved Users',
    type: 'user',
    params: {
      isIdUploaded: true,
      isVerified: true,
      isBusiness: false,
      isBanned: false
    }
  },
  {
    name: '🧍 Other Users',
    type: 'user',
    params: {
      isIdUploaded: false,
      isVerified: false,
      isBusiness: false,
      isBanned: false
    }
  },
  {
    name: '🧍 Banned Users',
    type: 'user',
    params: {
      isBanned: true
    }
  },
  {
    name: '🏢 Approved Businesses',
    type: 'business',
    params: {
      isIdUploaded: true,
      isVerified: true,
      isBusiness: true,
      isBanned: false
    }
  },
  {
    name: '🏢 Business Applicants',
    type: 'business',
    params: {
      isIdUploaded: false,
      isVerified: false,
      isBusiness: true,
      isBanned: false
    }
  }
]

const UserList = () => {
  const [actionRequiredList, setActionRequiredList] = useState({
    params: {
      isIdUploaded: true,
      isVerified: false
    }
  })
  const [list, setList] = useState(INITIAL_LIST)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [openIdUrl, setOpenIdUrl] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [images, setImages] = useState([])
  const [searchUsersOpened, setSearchUsersOpened] = useState(false)
  const [documentsOpened, setDocumentsOpened] = useState(false)
  const [userDetailsOpened, setUserDetailsOpened] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  // Search params
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [openEditUser, setOpenEditUser] = useState(false) 
  const [userToEdit, setUserToEdit] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [isIdUploaded, setIsIdUploaded] = useState('')
  const [isVerified, setIsVerified] = useState('')
  const [isBanned, setIsBanned] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [organizationRole, setOrganizationRole] = useState('')
  const [organizationUnit, setOrganizationUnit] = useState('')
  const [organizationUnits, setOrganizationUnits] = useState([])

  useEffect(() => {
    fetchActionRequiredList()
    fetchList()
    fetchOrganizationUnits()
  }, [])

  const fetchOrganizationUnits = async () => {
    try {
      const { data } = await axios.get('/api/v3/organizations/coop')
      setOrganizationUnits(
        (data?.data?.units || []).map((unit) => ({
          value: unit.name,
          label: unit.title,
        }))
      )
    } catch (err) {
      console.log('failed to fetch organization units', err)
    }
  }

  const fetchActionRequiredList = async () => {
    setLoading(true)
    try {
      const data = await getUsers(actionRequiredList.params)
      console.log('fetchActionRequiredList', data)
      setActionRequiredList((prev) => ({
        ...prev,
        results: data.data,
        limit: data.metadata.limit,
        page: data.metadata.page,
        total: data.metadata.total,
        totalPages: data.metadata.pages
      }))
      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  const fetchList = async (params = {}) => {
    setLoading(true)
    try {
      const newList = []
      await Promise.all(
        list.map(async (obj, i) => {
          const data = await getUsers({ ...list[i].params, ...params })
          newList[i] = {
            ...obj,
            results: data.data,
            limit: data.metadata.limit,
            page: data.metadata.page,
            total: data.metadata.total,
            totalPages: data.metadata.pages
          }
        })
      )
      setList(newList)

      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  const getUsers = async (params) => {
    const res = await axios.get(`/api/v3/bridge/users`, {
      params: {
        limit: PAGE_LIMIT,
        ...params
      }
    })
    return res.data
  }

  const tableData = useMemo(() => {
    const type = list[activeTab].type
    return list[activeTab]?.results
      ? list[activeTab]?.results.map((user) => {
          const obj = {
            organization: user.organization?.role ? (
              <img
                alt="CoopPay Logo"
                src="/images/cooppay-logo.svg"
                width="20"
                height="20"
              />
            ) : (
              <img
                alt="Pouch Logo"
                src="/images/logo.svg"
                width="24"
                height="24"
              />
            ),
            name: user.name,
            username: user.username,
            balance: formatBalance(
              user.balances[user.primaryCurrency],
              user.primaryCurrency
            ),
            contact: user.email || user.phone,
            user
          }
          if (type === 'business') {
            obj.tags = user.businessMetadata?.tags
          }
          return obj
        })
      : []
  }, [list, activeTab])

  const actionRequiredTableData = useMemo(() => {
    return actionRequiredList?.results
      ? actionRequiredList?.results.map((user) => {
          return {
            id: user.id,
            organization: user.organization?.role ? (
              <img
                alt="CoopPay Logo"
                src="/images/cooppay-logo.svg"
                width="20"
                height="20"
              />
            ) : (
              <img
                alt="Pouch Logo"
                src="/images/logo.svg"
                width="24"
                height="24"
              />
            ),
            name: user.name,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            suffix: user.suffix,
            username: user.username,
            balance: formatBalance(
              user.balances[user.primaryCurrency],
              user.primaryCurrency
            ),
            contact: user.email || user.phone,
            isDuplicate: user?.isDuplicate,
            isRisky: user?.isRisky
          }
        })
      : []
  }, [list, activeTab])

  const commonColumns = [
    {
      Header: '',
      accessor: 'organization'
    },
    {
      Header: 'Name',
      accessor: 'name'
    },
    {
      Header: 'Username', 
      accessor: 'username',
      Cell: ({ row, value }) => ( 
        <Box>
          <Anchor href={value} target="_blank" rel="noopener noreferrer">
            @{value}
          </Anchor>
        </Box>
      )
    },
    {
      Header: 'Balance',
      accessor: 'balance'
    },
    {
      Header: 'Contact',
      accessor: 'contact'
    }
  ]

  const businessColumns = [
    {
      Header: 'Tags',
      accessor: 'tags',
      Cell: ({ row }) => {
        const { username, tags } = row.original
        return (
          <>
            <div
              className="user-tags-icon-wrapper"
              onClick={() => toggleTag(username, 'local-bitcoin-islander')}
              style={{
                backgroundColor: tags?.includes('local-bitcoin-islander')
                  ? '#FAF'
                  : '#DDD'
              }}
            >
              <IconBeach />
            </div>
            <div
              className="user-tags-icon-wrapper"
              onClick={() => toggleTag(username, 'sari')}
              style={{
                backgroundColor: tags?.includes('sari') ? '#FAF' : '#DDD'
              }}
            >
              <IconBuildingStore />
            </div>
          </>
        )
      }
    }
  ]

  const customColumns = [
    [
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => {
          const { username, user } = row.original
          return (
            <Button.Group>
              <Button variant="outline" onClick={() => handleViewDetails(user)}>
                Details
              </Button>
              <Button
                variant="outline"
                onClick={() => handleUnapproveUser(username)}
              >
                ❌ Unapprove
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConvertCurrency(username)}
              >
                Convert
              </Button>
              <Button variant="outline" onClick={() => handleBan(username)}>
                Ban
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAmbassador(username, !user.isAmbassador)}
              >
                {user.isAmbassador ? 'Remove' : 'Make'} Ambassador
              </Button>
            </Button.Group>
          )
        }
      }
    ],
    [
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => {
          const { username, user } = row.original
          return (
            <Button.Group>
              <Button variant="outline" onClick={() => handleViewDetails(user)}>
                Details
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteUser(username)}
              >
                ❌ Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConvertCurrency(username)}
              >
                Convert
              </Button>
              <Button variant="outline" onClick={() => handleBan(username)}>
                Ban
              </Button>
            </Button.Group>
          )
        }
      }
    ],
    [
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => {
          const { username, user } = row.original
          return (
            <Button.Group>
              <Button variant="outline" onClick={() => handleViewDetails(user)}>
                Details
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteUser(username)}
              >
                ❌ Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConvertCurrency(username)}
              >
                Convert
              </Button>
              <Button variant="outline" onClick={() => handleUnban(username)}>
                Unban
              </Button>
            </Button.Group>
          )
        }
      }
    ],
    [
      ...businessColumns,
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => {
          const { username, user } = row.original
          return (
            <Button.Group>
              <Button variant="outline" onClick={() => handleViewDetails(user)}>
                Details
              </Button>
              <Button
                variant="outline"
                onClick={() => handleUnapproveUser(username)}
              >
                ❌ Unapprove
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConvertCurrency(username)}
              >
                Convert
              </Button>
              <Button variant="outline" onClick={() => handleUnban(username)}>
                Ban
              </Button>
            </Button.Group>
          )
        }
      }
    ],
    [
      ...businessColumns,
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => {
          const { username, user } = row.original
          return (
            <Button.Group>
              <Button variant="outline" onClick={() => handleViewDetails(user)}>
                Details
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteUser(username)}
              >
                ❌ Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConvertCurrency(username)}
              >
                Convert
              </Button>
              <Button variant="outline" onClick={() => handleUnban(username)}>
                Ban
              </Button>
            </Button.Group>
          )
        }
      }
    ]
  ]

  const tableColumns = useMemo(() => {
    return [...commonColumns, ...customColumns[activeTab]]
  }, [activeTab])

  const actionRequiredTableColumns = useMemo(() => {
    return [
      ...commonColumns,
      {
        Header: "Tags",
        accessor: "tags",
        Cell: ({ row, value }) => {
          const { isDuplicate, banned } = row.original
          return (
            <Box>
              {isDuplicate && <Chip checked={true} variant='filled' color="secondary" style={{ marginBottom:4, marginTop: 4 }}>Duplicate</Chip>}
              {banned && <Chip checked={true} variant='filled' color="error">Found in banned</Chip>}
              {!banned && !isDuplicate && <Text>None</Text>}
            </Box>
          )
        }
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => {
          const { id, username, firstName, lastName, middleName, suffix } = row.original
          return (
            <Button.Group>
              <Button
                variant="outline"
                onClick={() => handleEditUser({ id, username, firstName, lastName, middleName, suffix  })}
              >
                ✏ Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRetakeUser(username)}
              >
                🔁 Retake
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteUser(username)}
              >
                ❌ Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => handleApproveUser(username)}
              >
                ✔️ Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => handleViewDocuments(username, id)}
              >
                Review
              </Button>
            </Button.Group>
          )
        }
      }
    ]
  }, [activeTab])

  const handleSearchUsers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (firstName) params.firstName = firstName
      if (lastName) params.lastName = lastName
      if (name) params.name = name
      if (email) params.email = email
      if (username) params.username = username
      if (isIdUploaded) params.isIdUploaded = isIdUploaded
      if (isVerified) params.isVerified = isVerified
      if (isBanned) params.isBanned = isBanned
      if (organizationName) params.organizationName = organizationName
      if (organizationRole) params.organizationRole = organizationRole
      if (organizationUnit) params.organizationUnit = organizationUnit
      const data = await getUsers(params)
      setUserDetails(data)
      setUserDetailsOpened(true)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = async (username, tag) => {
    axios
      .post('api/v0/bridge/user/toggle-account-tag', { username, tag })
      .then(() => {
        fetchList()
      })
      .catch((err) => alert(err))
  }

  const handleViewDetails = async (data) => {
    setUserDetails(data)
    setUserDetailsOpened(true)
  }

  const handleDeleteUser = async (username) => {
    if (
      window.confirm(
        'Are you sure? A user may be deleted if they have no balance, and are not already approved'
      )
    ) {
      axios
        .put('/api/v0/bridge/user/manual-review', {
          username,
          action: 'delete'
        })
        .then(() => {
          fetchActionRequiredList()
          fetchList()
        })
        .catch(() => alert('error deleting user'))
    }
  }

  const handleApproveUser = (username) => {
    axios
      .put('/api/v0/bridge/user/manual-review', { username, action: 'approve' })
      .then(() => {
        fetchActionRequiredList()
        fetchList()
      })
      .catch(() => alert('error approving user'))
  }

  const handleUnapproveUser = (username) => {
    axios
      .put('/api/v0/bridge/user/manual-review', {
        username,
        action: 'unapprove'
      })
      .then(() => {
        fetchActionRequiredList()
        fetchList()
      })
      .catch(() => alert('error unapproving user'))
  }

  const handleEditUser = (user) => {
    setUserToEdit(user)
    setOpenEditUser(true)
  }

  const handleRetakeUser = (username) => {
    axios
      .put('/api/v0/bridge/user/manual-review', { username, action: 'retake' })
      .then(() => {
        fetchActionRequiredList()
        fetchList()
      })
      .catch(() => alert('error sending back to user for retake'))
  }

  const handleConvertCurrency = (username) => {
    const toCurrency = prompt(
      'Convert currency to what? (PHP, USD, CAD, or BTC)'
    )
    axios
      .put('/api/v0/bridge/user/convert-primary-currency', {
        username,
        toCurrency
      })
      .then((res) => alert('Success'))
      .catch(() => alert('Error'))
  }

  const handleBan = (username) => {
    const message = `You are about to ban ${username}. Are you sure?`
    if (confirm(message)) {
      axios
        .put('/api/v0/bridge/user/ban', { username, ban: true })
        .then((res) => {
          alert('Success')
          fetchList()
        })
        .catch((err) => alert(`Error ${err.response.data}`))
    }
  }

  const handleAmbassador = (username, makeAmbassador) => {
    axios
      .put('/api/v0/bridge/user/ambassador', { username, makeAmbassador })
      .then(() => {
        alert('Success')
        fetchList()
      })
      .catch(() => alert('error handling ambassador user status'))
  }

  const handleUnban = (username) => {
    const message = `You are about to unban ${username}. Are you sure?`
    if (confirm(message)) {
      axios
        .put('/api/v0/bridge/user/ban', { username, ban: false })
        .then((res) => {
          alert('Success')
          fetchList()
        })
        .catch((err) => alert(`Error ${err.response.data}`))
    }
  }

  const handleViewId = (username) => {
    axios
      .get(`/api/v0/bridge/user/view-id?username=${username}`)
      .then((res) => setOpenIdUrl(res.data))
      .catch(() => alert('error loading id'))
  }

  const handleViewDocuments = async (username, id) => {
    try {
      console.log('handleViewDocuments', username, id)
      const { data: imageKeys } = await axios.get('/api/v0/kyc/user/PH', {
        params: { userId: id, documents: true }
      })
      const imageList = imageKeys.map(async (key) => {
        const { data } = await axios.get(`/api/v0/image/url/${key}`)
        return data
      })
      const urls = await Promise.all(imageList)
      setImages(urls)
      setDocumentsOpened(true)
    } catch (err) {
      alert('error loading documents')
    }
  }

  const handlePageNum = async (value) => {
    setLoading(true)
    try {
      const data = await getUsers({
        ...list[activeTab].params,
        page: value > 0 ? value : 1
      })

      const cloneList = [...list]
      cloneList[activeTab] = { ...cloneList[activeTab], ...data }
      setList(cloneList)

      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  const handleSearchChange = async (e) => {
    setSearch(e.target.value)
  }

  const handleSearch = async () => {
    fetchList({ usernameRegex: search })
  }

  const totalUsers = list[0]?.total + list[1]?.total
  const totalBusinesses = list[3]?.total + list[4]?.total
  const tableProps = {
    rowsPerPage: PAGE_LIMIT,
    rowsPerPageList: [10, 30, 50, 100, 200],
    striped: true,
    height: 588,
    loading
  }

  if (error !== null) return <div>{error}</div>
  return (
    <>
      <Drawer
        opened={searchUsersOpened}
        onClose={() => setSearchUsersOpened(false)}
        title="Search Users"
        padding="sm"
        size="xl"
        position="right"
      >
        <TextInput
          mb="sm"
          label="First Name"
          placeholder="Enter first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
          type="text"
        />
        <TextInput
          mb="sm"
          label="Last Name"
          placeholder="Enter last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={loading}
          type="text"
        />
        <TextInput
          mb="sm"
          label="Name"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          type="text"
        />
        <TextInput
          mb="sm"
          label="Email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          type="text"
        />
        <TextInput
          mb="sm"
          label="Username"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          type="text"
        />
        <Checkbox
          mb="sm"
          label="Id Uploaded"
          checked={isIdUploaded}
          onChange={(e) => setIsIdUploaded(e.currentTarget.checked)}
          disabled={loading}
        />
        <Checkbox
          mb="sm"
          label="Verified"
          checked={isVerified}
          onChange={(e) => setIsVerified(e.currentTarget.checked)}
        />
        <Checkbox
          mb="sm"
          label="Banned"
          checked={isBanned}
          onChange={(e) => setIsBanned(e.currentTarget.checked)}
          disabled={loading}
        />
        <Select
          mb="sm"
          label="Organization name"
          placeholder="Select organization name"
          clearable
          data={[{ value: 'coop', label: 'COOP' }]}
          onChange={(e) => setOrganizationName(e.target.value)}
          disabled={loading}
        />
        <Select
          mb="sm"
          label="Organization Role"
          placeholder="Select organization role"
          clearable
          data={[
            { value: 'member', label: 'Member' },
            { value: 'individual', label: 'Individual' }
          ]}
          onChange={(e) => setOrganizationRole(e.target.value)}
          disabled={loading}
        />
        <Select
          mb="sm"
          label="Organization Unit"
          placeholder="Select organization unit"
          clearable
          data={organizationUnits}
          onChange={(e) => setOrganizationUnit(e.target.value)}
          disabled={loading}
        />
        <Button
          onClick={handleSearchUsers}
          loading={loading}
          disabled={loading}
        >
          Search
        </Button>
      </Drawer>
      <MantineModal
        opened={documentsOpened || userDetailsOpened}
        onClose={() => {
          setDocumentsOpened(false)
          setUserDetailsOpened(false)
        }}
        title="Documents"
        centered
        size="90%"
      >
        <ScrollArea type="always" style={{ height: '80vh' }}>
          {documentsOpened ? (
            images.map((url) => (
              <img
                key={url}
                src={url}
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '700px',
                  maxHeight: '500px',
                  margin: 10
                }}
              />
            ))
          ) : (
            <Text size="lg">
              <pre>{JSON.stringify(userDetails, null, 2)}</pre>
            </Text>
          )}
        </ScrollArea>
      </MantineModal>
      {userToEdit && openEditUser && (
        <EditModal 
          user={userToEdit} 
          opened={openEditUser} 
          onClose={()=> {
            setOpenEditUser(false)
            setUserToEdit(null)
          }} 
          onSave={async ()=>{
            await fetchActionRequiredList() 
            await fetchList()
            setOpenEditUser(false)
            setUserToEdit(null)
          }}
        />
      )}
   
      <IDModal openIdUrl={openIdUrl} setOpenIdUrl={setOpenIdUrl} />
      <Card title="Search Users">
        <Box>
          <Button onClick={() => setSearchUsersOpened(true)}>
            Search Filters
          </Button>
        </Box>
      </Card>
      <Card mt="lg" title={`Action Required (${actionRequiredList?.total})`}>
        <Box mt="sm">
          <Table
            data={actionRequiredTableData}
            columns={actionRequiredTableColumns}
            pagination={false}
            {...tableProps}
            height={300}
          />
        </Box>
      </Card>
      <Card
        mt="lg"
        title={
          <Group position="apart">
            <Group spacing="lg">
              <Text size="xl" weight={700}>{`Total Users: ${totalUsers}`}</Text>
              <Text
                size="xl"
                weight={700}
              >{`Total Businesses: ${totalBusinesses}`}</Text>
            </Group>
            <Group spacing={2}>
              <TextInput
                placeholder="Search by username"
                value={search}
                onChange={handleSearchChange}
              />
              <Button onClick={handleSearch}>Search</Button>
            </Group>
          </Group>
        }
      >
        <Tabs
          mt="sm"
          color="violet"
          radius="xs"
          defaultValue={activeTab.toString()}
          onTabChange={(value) => setActiveTab(Number(value))}
        >
          <Tabs.List>
            {list.map((data, i) => (
              <Tabs.Tab
                key={i}
                value={i.toString()}
              >{`${data.name} (${data.total})`}</Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        <Box mt="sm">
          <Table
            data={tableData}
            columns={tableColumns}
            totalPages={list[activeTab]?.totalPages}
            pageNum={list[activeTab]?.page}
            setPageNum={handlePageNum}
            {...tableProps}
          />
        </Box>
      </Card>
    </>
  )
}

const IDModal = ({ openIdUrl, setOpenIdUrl }) => {
  console.log(openIdUrl)
  return (
    <Modal
      open={Boolean(openIdUrl)}
      onClose={() => setOpenIdUrl(null)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: 'auto',
          height: 'auto',
          boxSizing: 'border-box',
          padding: '12px',
          backgroundColor: 'white',
          borderRadius: '4px',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            padding: '6px',
            cursor: 'pointer',
            fontSize: '24px'
          }}
          onClick={() => setOpenIdUrl(null)}
        >
          &times;
        </div>
        <img
          src={openIdUrl}
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '80vh'
          }}
        />
      </Box>
    </Modal>
  )
}

export default UserList
