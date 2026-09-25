import { Box, Table } from '@mantine/core'
import React from 'react'
import UserTableBodyRow from './UserTableBodyRow'

const headers = ['', 'Username', 'Name', 'Contact', 'Balance', 'Tags', '']

const UsersTable = ({ activeTab, users, refetchUsers }) => {
  return (
    <Box
      sx={{
        overflow: 'auto',
        marginTop: 30,
        width: '100%'
      }}
    >
      <Table style={{ outline: 0, border: 0 }}>
        <thead>
          <tr>
            {headers.map((header) => {
              return (
                <th
                  key={header}
                  style={{
                    padding: header ? '20px 0' : '6px 0',
                    backgroundColor: '#6922FF',
                    color: '#fff',
                    fontSize: 16
                  }}
                >
                  {header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            return (
              <UserTableBodyRow
                activeTab={activeTab}
                key={user.id}
                user={user}
                refetchUsers={refetchUsers}
              />
            )
          })}
        </tbody>
      </Table>
    </Box>
  )
}

export default UsersTable
