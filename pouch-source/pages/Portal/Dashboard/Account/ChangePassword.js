import { useState } from 'react'
import axios from 'axios'
import {
  useMantineTheme,
  PasswordInput,
  Alert,
  Modal,
  Text,
  Loader,
  Center
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification, updateNotification } from '@mantine/notifications'
import { BackButton, Button, Card } from 'components'
import isValid from 'helpers/signup-validators'
import { IconCheck } from '@tabler/icons'

const ChangePassword = () => {
  const theme = useMantineTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    },
    validate: {
      oldPassword: (value) =>
        value ? null : 'Your current password is required',
      newPassword: (value) =>
        value
          ? isValid.password(value)
            ? null
            : 'Please use a stronger password'
          : 'Your new password is required',
      confirmNewPassword: (value, values) =>
        isValid.confirmPassword(value, values.newPassword)
          ? null
          : 'Passwords do not match'
    }
  })

  const handleFormSubmit = form.onSubmit(async () => {
    setLoading(true)
    showNotification({
      id: 'change-password',
      loading: true,
      title: 'Update Password In Progress',
      message: 'Please wait while we update your password...',
      disallowClose: true
    })

    try {
      const { data } = await axios.patch('/api/v2/user/change-password', {
        oldPassword: form.values.oldPassword,
        newPassword: form.values.newPassword
      })
      if (data) {
        handleBack()
        updateNotification({
          id: 'change-password',
          title: 'Password Changed Successfully',
          message: 'Your password has been updated',
          autoClose: false,
          icon: (
            <Center
              style={{
                width: 30,
                height: 30,
                backgroundColor: theme.other[theme.colorScheme].success,
                borderRadius: theme.radius.max
              }}
            >
              <IconCheck size={20} color={theme.white} />
            </Center>
          )
        })
      }
    } catch (err) {
      updateNotification({
        id: 'change-password',
        autoClose: 0
      })
      setError(err.response.data)
    } finally {
      setLoading(false)
    }
  })

  const handleBack = () => {
    history.back()
  }

  return (
    <>
      <Modal withCloseButton={false}>
        <Text>Please wait while we update your password...</Text>
        <Loader />
      </Modal>
      {loading ? null : <BackButton onClick={handleBack} />}
      <Card mt="md" title="Change Password">
        <form onSubmit={handleFormSubmit}>
          <PasswordInput
            mt="sm"
            size="md"
            label="Password"
            placeholder="Enter your current password"
            autoComplete="old-password"
            {...form.getInputProps('oldPassword')}
          />
          <PasswordInput
            mt="sm"
            size="md"
            label="New Password"
            placeholder="Enter your new password"
            autoComplete="new-password"
            {...form.getInputProps('newPassword')}
          />
          <PasswordInput
            mt="sm"
            size="md"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            autoComplete="confirm-new-password"
            {...form.getInputProps('confirmNewPassword')}
          />
          {error ? (
            <Alert mt="md" title="Error" color="red">
              {error}
            </Alert>
          ) : null}
          <Button mt="lg" disabled={loading} type="submit">
            Update Password
          </Button>
        </form>
      </Card>
    </>
  )
}

export default ChangePassword
