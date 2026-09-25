import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { Button, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import Card from 'components/Card'
import BackButton from 'components/BackButton'

const AddPouchContact = ({ user }) => {
  const history = useHistory()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      username: ''
    }
  })

  const handleBack = () => history.replace('/dashboard/manage-contacts')

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true)
    form.clearErrors()
    try {
      const username = values.username.toLowerCase()

      // If username is equal to current user username, then don't add
      if (user.username === username) {
        form.setFieldError('username', 'You cannot add yourself')
        return
      }
      // If username already exists in user's contact, then don't add
      if (
        user.contacts.find((contact) => contact.entityIdentifier === username)
      ) {
        form.setFieldError(
          'username',
          'Username already exists in your contacts'
        )
        return
      }

      const { data } = await axios.post('/api/v2/user/contact', {
        entityType: 'pouch-user',
        entityIdentifier: username
      })
      if (data) {
        history.replace('/dashboard/manage-contacts')
        history.go()
      }
    } catch (err) {
      form.setFieldError(
        'username',
        err.response.data || 'Error adding contact'
      )
    } finally {
      setLoading(false)
    }
  })

  return (
    <>
      <BackButton onClick={handleBack} />
      <Card mt="xs" title="Add Pouch Contact">
        <form onSubmit={handleSubmit}>
          <TextInput
            mt="md"
            size="md"
            label="Username"
            placeholder="Enter username"
            disabled={loading}
            {...form.getInputProps('username')}
          />
          <Button
            mt="lg"
            type="submit"
            loading={loading}
            disabled={!form.values.username}
          >
            Add Pouch Contact
          </Button>
        </form>
      </Card>
    </>
  )
}

export default AddPouchContact
