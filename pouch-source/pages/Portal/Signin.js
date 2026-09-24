import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import {
  createStyles,
  TextInput,
  Space,
  Title,
  Button,
  Group,
  Paper,
  Container,
  Text,
  Image,
  useMantineColorScheme,
  Center,
  Box,
  PasswordInput,
  Stack,
} from '@mantine/core'
import pouchLogo from 'assets/images/logo.svg'
import pouchLogoWhite from 'assets/images/logo-white.svg'
import { IconBrandApple, IconBrandAndroid } from '@tabler/icons'

const Signin = ({ setUser, refreshProfilePicture }) => {
  const { classes } = useStyles()
  const history = useHistory()
  const { colorScheme } = useMantineColorScheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/v0/auth', { username, password })
      const user = res.data.user
      setUser(user)

      const verify = user && !user?.verified.email && !user?.verified.phone
      if (verify) {
        history.replace('/verify')
      } else {
        history.replace('/dashboard')
        refreshProfilePicture()
      }
    } catch (err) {
      const errorText = [400, 401].includes(error.response?.status)
        ? 'Invalid username or password'
        : error.response?.data?.message
      setError(errorText)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    history.replace('/forgot-password')
  }

  const handleCreateAccount = () => {
    window.location.href = `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/signup`
  }

  return (
    <Container className={classes.wrapper}>
      <Center>
        <Image
          src={colorScheme === 'light' ? pouchLogo : pouchLogoWhite}
          width="60px"
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        />
      </Center>
      <Title order={2} sx={{ textAlign: 'center', margin: '48px' }}>
        Sign In
      </Title>
      <Space h="xl" />
      <form onSubmit={handleSignIn}>
        <TextInput
          size="md"
          value={username}
          label="Username"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          type="text"
        />
        <PasswordInput
          mt="sm"
          size="md"
          label="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <Text mt="sm" size="md" className={classes.error}>
            {error}
          </Text>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="subtle"
            disabled={loading}
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </Button>
        </Box>
        <Button
          mt="sm"
          size="md"
          radius="md"
          fullWidth
          type="submit"
          disabled={loading}
        >
          Sign In
        </Button>
      </form>
      <Button
        mt="sm"
        size="md"
        radius="md"
        fullWidth
        variant="transparent"
        disabled={loading}
        onClick={handleCreateAccount}
      >
        Create an account
      </Button>
    </Container>
  )
}

export default Signin

const useStyles = createStyles((theme) => ({
  wrapper: {
    maxWidth: 556,
  },
  error: {
    color: theme.other.error,
    textAlign: 'center',
  },
}))
