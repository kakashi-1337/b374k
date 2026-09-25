import React, { useState } from 'react'
import axios from 'axios'
import { Button, Radio, Text, Textarea, TextInput } from '@mantine/core'
import { Card } from 'components'

const SEND_TO_TYPE = {
  allUsers: 'all-users',
  specificUsers: 'specific-users'
}

const Mailroom = () => {
  const [sendToType, setSelectedType] = useState(SEND_TO_TYPE.allUsers)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [specificUsers, setSpecificUsers] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    try {
      setLoading(true)
      await axios.post('/api/v2/notifications/batch-notifications', {
        type: sendToType,
        message,
        title,
        specificUsers
      })
    } catch (error) {
      console.error('Error sending notifications', error)
    } finally {
      setLoading(false)
      setSelectedType(SEND_TO_TYPE.allUsers)
      setTitle('')
      setMessage('')
      setSpecificUsers('')
    }
  }

  if (loading) return <div className="loader" />

  return (
    <Card>
      <Radio.Group
        mb="md"
        value={sendToType}
        onChange={setSelectedType}
        name="send-type"
        label="Send to"
        withAsterisk
      >
        <Radio value={SEND_TO_TYPE.allUsers} label="All Users" />
        <Radio value={SEND_TO_TYPE.specificUsers} label="Specific Users" />
      </Radio.Group>
      {sendToType === 'specific-users' && (
        <TextInput
          value={specificUsers}
          onChange={(e) => setSpecificUsers(e.target.value)}
          mb="md"
          description="Usernames should be separated by comma with no spaces in between. e.g bill,ethan,eds"
          placeholder="e.g bill,ethan,eds"
          label="Specific Users"
          withAsterisk
        />
      )}
      <TextInput
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        mb="md"
        placeholder="e.g Pouch Notice"
        label="Title"
        withAsterisk
      />
      <Textarea
        value={message}
        onChange={(e) => {
          const newMessage = e.target.value
          if (newMessage.length >= 178) {
            setError('Max length of 178 characters')
          } else {
            setError('')
          }

          setMessage(e.target.value)
        }}
        mb="md"
        label="Message"
        placeholder="e.g Globe load is not available..."
        withAsterisk
        minRows={10}
        maxRows={10}
        maxLength={178}
      />
      {error ? (
        <Text
          weight={600}
          mb={10}
          size={14}
          style={{
            color: '#FF3535'
          }}
        >
          {error}
        </Text>
      ) : null}
      <Button
        disabled={
          !title ||
          !message ||
          (sendToType === SEND_TO_TYPE.specificUsers && !specificUsers)
        }
        onClick={handleSend}
      >
        Send
      </Button>
    </Card>
  )
}

export default Mailroom
