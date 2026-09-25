import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  createStyles,
  useMantineTheme,
  TextInput,
  Title,
  Button,
  Container,
  Text,
  Group
} from '@mantine/core'
import { v4 as uuid } from 'uuid'

const Verification = ({
  contactMethod,
  email,
  phone,
  setMfaKey,
  setActiveStep
}) => {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const [code, setCode] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [error, setError] = useState('')
  const [sendCodeCountdown, setSendCodeCountdown] = useState(undefined)
  const [timerDisplayString, setTimerDisplayString] = useState('')
  const [successKey] = useState(uuid) // success key can be used to authenticate protected actions for 15 mins

  const contact = contactMethod === 'email' ? email : phone

  const sendAuthCode = () => {
    setSendingCode(true)
    setSendCodeCountdown(60 * 15) // 15 minutes
    setError('')
    axios
      .get('/api/v0/auth/send-auth-code', {
        params: { contactMethod, contact }
      })
      .then(() => {
        setSendingCode(false)
      })
      .catch((err) => {
        setSendingCode(false)
        const error =
          err.response?.status === 500
            ? 'Server Error'
            : err.response?.data?.toString() || 'Server Error'
        setError(error)
      })
  }

  const verifyAuthCode = () => {
    if (code.length !== 6) return setError('Invalid Code')
    else setError('')
    setVerifyingCode(true)
    axios
      .get('/api/v0/auth/verify-auth-code', {
        params: { contactMethod, contact, code, successKey }
      })
      .then(() => {
        setMfaKey(successKey)
        setActiveStep(2)
      })
      .catch((err) => {
        setVerifyingCode(false)
        const error =
          err.response?.status === 500
            ? 'Server Error'
            : err.response?.data?.toString() || 'Server Error'
        setError(error)
      })
  }

  useEffect(() => {
    sendAuthCode()
  }, [])

  useEffect(() => {
    if (code.length === 6) verifyAuthCode()
  }, [code])

  useEffect(() => {
    const newTime = sendCodeCountdown - 1
    if (newTime === -1) setSendCodeCountdown(undefined)
    if (newTime > -1) {
      setTimeout(() => {
        setSendCodeCountdown(newTime)
        const minutes = Math.floor(newTime / 60)
        const seconds = newTime % 60
        const timerDisplayString = `${minutes}:${
          seconds < 10 ? '0' : ''
        }${seconds}`
        setTimerDisplayString(timerDisplayString)
      }, 1000)
    }
  }, [sendCodeCountdown])

  const handleCancel = () => {
    setActiveStep(0)
  }

  return (
    <Container className={classes.wrapper}>
      <Title order={2} sx={{ textAlign: 'center', margin: '48px' }}>
        Verification Code
      </Title>
      <Group spacing="xs" align="left">
        <Text mb="sm">We have sent this to</Text>
        <Text style={{ color: theme.other[theme.colorScheme].primary }}>
          {contactMethod === 'email' ? email : phone}
        </Text>
      </Group>
      <TextInput
        size="lg"
        value={code}
        label="Code"
        placeholder="Enter verification code"
        onChange={(e) => setCode(e.target.value)}
        type="text"
        error={error}
      />
      <Button
        mt={80}
        size="lg"
        radius="md"
        fullWidth
        onClick={sendAuthCode}
        loading={sendingCode || verifyingCode}
        disabled={sendingCode || verifyingCode || sendCodeCountdown}
      >
        {sendCodeCountdown !== undefined
          ? `Resend (${timerDisplayString})`
          : 'Send New Code'}
      </Button>
      <Button
        mt="md"
        size="lg"
        radius="md"
        variant="subtle"
        fullWidth
        onClick={handleCancel}
        disabled={sendingCode || verifyingCode}
      >
        Cancel
      </Button>
    </Container>
  )
}

export default Verification

const useStyles = createStyles(() => ({
  wrapper: {
    maxWidth: 556
  }
}))
