import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Text,
  Group,
  Grid,
  TextInput,
  Avatar,
  Select,
  Radio,
  Switch,
  createStyles
} from '@mantine/core'
import { Button, Card } from 'components'
import { useUserContext } from 'hooks/useUserContext'
import { useBanks } from 'hooks'
import axios from 'axios'
import AutomaticWithdrawals from './BusinessSettings/AutomaticWithdrawals'
import MerchantCashback from './BusinessSettings/MerchantCashback'

const ListItem = ({ label, children }) => {
  return (
    <>
      <Grid.Col sm={3}>
        <Text weight={600}>{label}</Text>
      </Grid.Col>
      <Grid.Col sm={9}>{children}</Grid.Col>
    </>
  )
}

const Account = () => {
  const history = useHistory()
  const { user } = useUserContext()
  const { profilePicture } = useUserContext()
  const [fullName, setFullName] = useState(user?.name)
  const [username, setUsername] = useState(user?.username)
  const [email, setEmail] = useState(user?.email)
  const [mobileNumber, setMobileNumber] = useState(user?.phone)

  const handleFullName = (e) => {
    const { value } = e.target
    setFullName(value)
  }

  const handleUsername = (e) => {
    const { value } = e.target
    setUsername(value)
  }

  const handleEmail = (e) => {
    const { value } = e.target
    setEmail(value)
  }

  const handleMobileNumber = (e) => {
    const { value } = e.target
    setMobileNumber(value)
  }

  const handleChangePassword = () => {
    history.push('/dashboard/account/change-password')
  }

  return (
    <>
      <Card title="Account">
        <Grid align="center">
          <ListItem label="Account Picture">
            <Group>
              <Avatar radius="max" size="xl" src={profilePicture} />
            </Group>
          </ListItem>
          <ListItem label="Full Name">
            <TextInput
              variant="filled"
              placeholder="Enter full name"
              disabled={true}
              value={fullName}
              onChange={handleFullName}
              sx={{ flex: 1 }}
            />
          </ListItem>
          <ListItem label="Username">
            <TextInput
              variant="filled"
              placeholder="Enter username"
              disabled={true}
              value={username}
              onChange={handleUsername}
              sx={{ flex: 1 }}
            />
          </ListItem>
          <ListItem label="Email">
            <TextInput
              variant="filled"
              disabled={true}
              value={email}
              onChange={handleEmail}
              sx={{ flex: 1 }}
            />
          </ListItem>
          <ListItem label="Mobile Number">
            <TextInput
              variant="filled"
              disabled={true}
              value={mobileNumber}
              onChange={handleMobileNumber}
              sx={{ flex: 1 }}
            />
          </ListItem>
          <ListItem label="Password">
            <Button variant="subtle" onClick={handleChangePassword}>
              Change Password
            </Button>
          </ListItem>
          <ListItem label="Account Level">
            <Text>{user?.verificationLevel}</Text>
          </ListItem>
          {/* <ListItem label="Delete Account">
          <Button variant="subtle" color="red">
            Request Account Deletion
          </Button>
        </ListItem> */}
        </Grid>
      </Card>
      {user.businessMetadata.isBusiness && (
        <>
          <AutomaticWithdrawals user={user} isBridgeUser={false} />
          <MerchantCashback user={user} isBridgeUser={false} />
        </>
      )}
    </>
  )
}

export default Account
