import {
  Button,
  Checkbox,
  Chip,
  Modal,
  Textarea,
  ScrollArea,
  Select,
  Text,
} from '@mantine/core'
import React, { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'

import formatBalance from 'helpers/format-balance'
import ReviewUserInfoModal from './ReviewUserInfoModal'
import {
  getActions,
  onViewTransactions,
  onAcceptUser,
  onRetakeUser,
  onUpgradeUser,
} from './migrationApplicationsHelpers'
import retakeFields from '../applications/retakeFields'

const UserTableBodyRow = ({ activeTab, user, refetchUsers }) => {
  const [opened, { open, close }] = useDisclosure(false)
  const [
    openedRetakeFieldsModal,
    { open: openRetakeFieldsModal, close: closeRetakeFieldsModal },
  ] = useDisclosure(false)
  const [selectedRetakeFields, setSelectedRetakeFields] = useState(
    Array.from(Array(retakeFields.length)),
  )
  const [retakeNote, setRetakeNote] = useState(user?.verified?.retakeNote || '')

  const handleSelect = async (value, user) => {
    if (value === 'view') {
      open()
    } else if (value === 'view_transactions') {
      onViewTransactions(user.username)
    } else if (value === 'accept') {
      await onAcceptUser(user)
      await refetchUsers()
    } else if (value === 'retake') {
      openRetakeFieldsModal()
    } else if (value === 'upgrade') {
      await onUpgradeUser(user)
      await refetchUsers()
    } else {
      return
    }
  }

  const handleSelectedRetakeFields = (item, index) => {
    const newSelectedRetakeFields = [...selectedRetakeFields]
    newSelectedRetakeFields[index] = newSelectedRetakeFields[index]
      ? undefined
      : item.value
    setSelectedRetakeFields(newSelectedRetakeFields)
  }

  return (
    <>
      <Modal opened={opened} onClose={close} size="100%">
        <ReviewUserInfoModal user={user} />
      </Modal>
      <Modal
        title="Select fields that needs retake"
        centered
        opened={openedRetakeFieldsModal}
        onClose={closeRetakeFieldsModal}
      >
        <ScrollArea
          type="auto"
          style={{ height: '50vh', paddingRight: 30, width: '100%' }}
        >
          {retakeFields.map((item, index) => {
            if (item.disabled(user)) {
              return <></>
            }
            return (
              <Checkbox
                key={item.value}
                value={item.value}
                label={item.label}
                mb={5}
                checked={selectedRetakeFields.includes(item.value)}
                onChange={() => handleSelectedRetakeFields(item, index)}
              />
            )
          })}
        </ScrollArea>
        <Textarea
          placeholder="Enter Note"
          label="Note"
          maxLength={256}
          value={retakeNote}
          onChange={(event) => setRetakeNote(event.currentTarget.value)}
        />
        <Button
          fullWidth
          mt={20}
          disabled={selectedRetakeFields.length === 0}
          onClick={() => {
            if (selectedRetakeFields.length === 0) return

            onRetakeUser(
              user,
              selectedRetakeFields.filter((field) => field),
              retakeNote,
            )
            closeRetakeFieldsModal()
            refetchUsers()
          }}
        >
          Save
        </Button>
      </Modal>
      <tr key={user._id}>
        <td style={styles.organizationCellStyle}>
          {user.organization?.role ? (
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
          )}
        </td>
        <td style={styles.otherCellStyle}>{user.username}</td>
        <td style={styles.otherCellStyle}>{user.name}</td>
        <td style={styles.otherCellStyle}>
          {user.email ? <div>{user.email}</div> : null}
          {user.phone ? <div>{user.phone}</div> : null}
        </td>
        <td style={styles.otherCellStyle}>
          {formatBalance(user.balances['PHP'], 'PHP')}
        </td>
        <td>
          {user.isDuplicate && (
            <Chip checked={true} variant="filled" color="error" mb={10}>
              Duplicate
            </Chip>
          )}
          {user.banned && (
            <Chip checked={true} variant="filled" color="error" mb={10}>
              Found in banned
            </Chip>
          )}
          {!user.banned && !user.isDuplicate && (
            <Text weight={700} size={14}>
              None
            </Text>
          )}
        </td>
        <td>
          <Select
            defaultValue="action"
            value="action"
            data={getActions(activeTab)}
            onChange={(value) => handleSelect(value, user)}
          />
        </td>
      </tr>
    </>
  )
}

const styles = {
  organizationCellStyle: {
    padding: '20px 0 20px 6px',
  },
  otherCellStyle: {
    padding: '20px 10px 20px 0',
  },
}

export default UserTableBodyRow
