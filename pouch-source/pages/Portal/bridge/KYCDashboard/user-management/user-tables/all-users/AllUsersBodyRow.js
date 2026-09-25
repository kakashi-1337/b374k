import { Modal, Select } from '@mantine/core'
import React from 'react'
import ReviewUserInfoModal from '../../../applications/ReviewUserInfoModal'
import { useDisclosure } from '@mantine/hooks'
import formatBalance from 'helpers/format-balance'
import {
  isUserBanned,
  onViewTransactions,
  onBanUser,
  onMakeUserAmbassador,
} from '../../userManagementHelpers'

const AllUsersBodyRow = ({ user, refetchUsers }) => {
  const [opened, { open, close }] = useDisclosure(false)

  const handleSelect = async (value, user) => {
    if (value === 'view') {
      open()
    } else if (value === 'view_transactions') {
      onViewTransactions(user.username)
    } else if (value === 'ban') {
      await onBanUser(user, true)
      await refetchUsers()
    } else if (value === 'make_ambassador') {
      await onMakeUserAmbassador(user, true)
      await refetchUsers()
    } else if (value === 'remove_ambassador') {
      await onMakeUserAmbassador(user, false)
      await refetchUsers()
    } else {
      return
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} size="60%" style={{ top: -40 }}>
        <ReviewUserInfoModal user={user} refetchUsers={refetchUsers} />
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
          <Select
            defaultValue="action"
            value="action"
            data={[
              { label: 'Actions', value: 'action', disabled: true },
              { label: 'View Details', value: 'view' },
              { label: 'View Transactions', value: 'view_transactions' },
              {
                label: isUserBanned(user) ? 'Unban' : 'Ban',
                value: isUserBanned(user) ? 'unban' : 'ban',
              },
              {
                label: user.isAmbassador
                  ? 'Remove Ambassador'
                  : 'Make Ambassador',
                value: user.isAmbassador
                  ? 'remove_ambassador'
                  : 'make_ambassador',
              },
            ]}
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

export default AllUsersBodyRow
