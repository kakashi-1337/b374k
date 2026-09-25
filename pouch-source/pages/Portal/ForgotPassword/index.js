import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { AsYouTypeFormatter } from 'google-libphonenumber'
import {
  createStyles,
  TextInput,
  Space,
  Title,
  Button,
  Container,
  Text,
  Group
} from '@mantine/core'
import isValid from 'helpers/signup-validators'
import { formatPhoneE164 } from 'helpers/phoneHelpers'
import Verification from './Verification'
import ResetPassword from './ResetPassword'
import Result from './Result'

const COUNTRY_CODE = 'PH'

const MainForgotPassword = ({
  email,
  setEmail,
  phone,
  setPhone,
  usePhone,
  setUsePhone,
  setActiveStep
}) => {
  const { classes } = useStyles()
  const history = useHistory()
  const [error, setError] = useState('')
  const formatter = new AsYouTypeFormatter(COUNTRY_CODE)

  const handlePhoneChange = (e) => {
    setPhone('')
    const numberOnly = e.target.value.replace(/\D/g, '')
    let formatted = ''
    for (let c of numberOnly) {
      formatted = formatter.inputDigit(c)
    }
    setPhone(formatted)
  }

  const handleEmailChange = (e) => {
    setError('')
    setEmail(e.target.value)
  }

  const handleContactMethod = () => {
    setUsePhone(!usePhone)
    setError('')
  }

  const handleSendResetCode = () => {
    const isEmailValid = isValid.email(email)
    const formattedPhone = formatPhoneE164(phone, COUNTRY_CODE)
    const isPhoneValid = isValid.phone(formattedPhone, COUNTRY_CODE)
    const error = usePhone
      ? isPhoneValid
        ? ''
        : 'Invalid phone number'
      : isEmailValid
      ? ''
      : 'Invalid email address'

    setError(error)

    const willProceed = usePhone ? isPhoneValid : isEmailValid
    if (willProceed) {
      setActiveStep(1)
    }
  }

  const handleBack = () => {
    history.replace('/signin')
  }

  return (
    <Container className={classes.wrapper}>
      <Title order={2} sx={{ textAlign: 'center', margin: '48px' }}>
        Forgot Password
      </Title>
      <Space h="xl" />
      {usePhone ? (
        <TextInput
          size="lg"
          value={phone}
          label="Phone"
          placeholder="Ex. 9123456789"
          onChange={handlePhoneChange}
          type="text"
          error={error}
          icon={<Text>+63</Text>}
        />
      ) : (
        <TextInput
          size="lg"
          value={email}
          label="Email"
          placeholder="Ex. juandelacruz@email.com"
          onChange={handleEmailChange}
          type="text"
          error={error}
        />
      )}
      <Group position="right">
        <Button size="xs" variant="subtle" onClick={handleContactMethod}>
          Use {usePhone ? 'email' : 'mobile number'} instead
        </Button>
      </Group>
      <Text mt={80} mb="sm">
        For further assistance, send an email to support@pouch.ph
      </Text>
      <Button
        size="lg"
        radius="md"
        fullWidth
        onClick={handleSendResetCode}
        disabled={usePhone ? !phone : !email}
      >
        Send Reset Code
      </Button>
      <Button
        mt="md"
        size="lg"
        radius="md"
        variant="subtle"
        fullWidth
        onClick={handleBack}
      >
        Back to Sign In
      </Button>
    </Container>
  )
}

const ForgotPassword = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [usePhone, setUsePhone] = useState(false)
  const [mfaKey, setMfaKey] = useState('')

  const contactMethod = usePhone ? 'phone' : 'email'
  const formattedPhone = formatPhoneE164(phone, COUNTRY_CODE)

  if (activeStep === 0) {
    return (
      <MainForgotPassword
        phone={phone}
        setPhone={setPhone}
        email={email}
        setEmail={setEmail}
        usePhone={usePhone}
        setUsePhone={setUsePhone}
        setActiveStep={setActiveStep}
      />
    )
  } else if (activeStep === 1) {
    return (
      <Verification
        contactMethod={contactMethod}
        phone={formattedPhone}
        email={email}
        setMfaKey={setMfaKey}
        setActiveStep={setActiveStep}
      />
    )
  } else if (activeStep === 2) {
    return (
      <ResetPassword
        contactMethod={contactMethod}
        phone={formattedPhone}
        email={email}
        mfaKey={mfaKey}
        setActiveStep={setActiveStep}
      />
    )
  } else if (activeStep === 3) {
    return <Result setActiveStep={setActiveStep} />
  }
}

export default ForgotPassword

const useStyles = createStyles(() => ({
  wrapper: {
    maxWidth: 556
  }
}))
