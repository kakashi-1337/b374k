import { useState } from 'react'
import axios from 'axios'
import {
  createStyles,
  TextInput,
  Title,
  Button,
  Container,
  ActionIcon
} from '@mantine/core'
import { EyeSlash, Eye } from 'iconsax-react'
import isValid from 'helpers/signup-validators'

const ResetPassword = ({
  contactMethod,
  email,
  phone,
  mfaKey,
  setActiveStep
}) => {
  const { classes } = useStyles()
  const [values, setValues] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleValues = (value, name) => {
    const newValues = { ...values }
    newValues[name] = value
    setValues(newValues)
  }

  const handleErrors = (error, name) => {
    const newErrors = { ...errors }
    newErrors[name] = error
    setErrors(newErrors)
  }

  const handleSubmit = () => {
    setLoading(true)

    if (!values.password) {
      handleErrors('Please enter a new password', 'password')
      return setLoading(false)
    } else if (!isValid.password(values.password)) {
      handleErrors('Please use a stronger password', 'password')
      return setLoading(false)
    } else if (
      values.confirmPassword &&
      !isValid.password(values.confirmPassword)
    ) {
      handleErrors('Passwords do not match', 'confirmPassword')
      return setLoading(false)
    } else {
      axios
        .patch('/api/v0/user/reset-password', {
          contactMethod,
          contact: contactMethod === 'email' ? email : phone.replace(/\s/g, ''),
          password: values.password,
          mfaKey
        })
        .then(() => {
          setLoading(false)
          setActiveStep(3)
        })
        .catch((err) => {
          setLoading(false)
          handleErrors(
            err.response?.data?.message || 'Server Error',
            'password'
          )
        })
    }
  }

  const handleCancel = () => {
    history.replace('/signin')
  }

  return (
    <Container className={classes.wrapper}>
      <Title order={2} sx={{ textAlign: 'center', margin: '48px' }}>
        Reset Password
      </Title>
      <TextInput
        size="lg"
        label="New Password"
        placeholder="Enter new password"
        value={values.password}
        onChange={(e) => handleValues(e.target.value, 'password')}
        autoCapitalize="none"
        type={showPassword ? 'text' : 'password'}
        disabled={loading}
        error={errors.password}
        rightSection={
          <ActionIcon
            mr="lg"
            variant="transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye /> : <EyeSlash />}
          </ActionIcon>
        }
      />
      <TextInput
        mt="md"
        size="lg"
        label="Confirm New Password"
        placeholder="Confirm new password"
        value={values.confirmPassword}
        onChange={(e) => handleValues(e.target.value, 'confirmPassword')}
        autoCapitalize="none"
        type={showConfirmPassword ? 'text' : 'password'}
        disabled={loading}
        error={errors.confirmPassword}
        rightSection={
          <ActionIcon
            mr="lg"
            variant="transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <Eye /> : <EyeSlash />}
          </ActionIcon>
        }
      />
      <Button
        mt="xl"
        size="lg"
        radius="md"
        fullWidth
        onClick={handleSubmit}
        loading={loading}
        disabled={loading}
      >
        Reset Password
      </Button>
      <Button
        mt="md"
        size="lg"
        radius="md"
        variant="subtle"
        fullWidth
        onClick={handleCancel}
        disabled={loading}
      >
        Cancel
      </Button>
    </Container>
  )
}

export default ResetPassword

const useStyles = createStyles(() => ({
  wrapper: {
    maxWidth: 556
  }
}))
