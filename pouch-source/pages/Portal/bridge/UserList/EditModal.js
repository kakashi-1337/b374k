import { Button, Modal, TextInput } from '@mantine/core'
import axios from 'axios'
import React from 'react'
import { useState } from 'react'

const EditModal = ({ user, opened, onClose, onSave }) => {
  const [firstName, setFirstName] = useState(user.firstName || '')
  const [middleName, setMiddleName] = useState(user.middleName || '')
  const [lastName, setLastName] = useState(user.lastName || '')
  const [suffix, setSuffix] = useState(user.suffix || '')
  const [loading, setLoading] = useState(false)
  const isModified = firstName !== user.firstName || lastName !== user.lastName

  const handleSave = async () => {
    try {
      setLoading(true)
      console.log(firstName, lastName)
      await axios.put(`/api/v3/bridge/users/${user.id}/update`, {
        fields: {
          firstName,
          middleName,
          lastName,
          suffix
        },
        action: 'update'
      })

      await onSave()
    } catch (error) {
      console.error('Error saving', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit User"
      centered
      size="50%"
    >
      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <TextInput
            size="lg"
            value={firstName}
            label="First Name"
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
            type="text"
            style={{ marginBottom: '6px' }}
          />
          <TextInput
            size="lg"
            value={middleName}
            label="Middle Name"
            placeholder="Middle Name"
            onChange={(e) => setMiddleName(e.target.value)}
            type="text"
            style={{ marginBottom: '6px' }}
          />
          <TextInput
            size="lg"
            value={lastName}
            label="Last Name"
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
            type="text"
          />
          <TextInput
            size="lg"
            value={suffix}
            label="Suffix"
            placeholder="Suffix"
            onChange={(e) => setSuffix(e.target.value)}
            type="text"
            style={{ marginBottom: '6px' }}
          />
          <Button
            mt="xl"
            size="lg"
            radius="md"
            fullWidth
            type="submit"
            disabled={!isModified || loading || !firstName || !lastName}
            onClick={handleSave}
          >
            Save
          </Button>
        </>
      )}
    </Modal>
  )
}

export default EditModal
