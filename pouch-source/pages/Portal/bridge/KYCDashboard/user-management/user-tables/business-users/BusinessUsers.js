import { Box, Table } from '@mantine/core'
import React from 'react'
import BusinessUsersBodyRow from './BusinessUsersBodyRow'

const headers = ['', 'Username', 'Name', 'Contact', 'Balance', '']

const BusinessUsers = ({ users, refetchUsers }) => {
  return (
    <Box
      sx={{
        overflow: 'scroll',
        marginTop: 30,
        width: '100%',
        maxHeight: 500
      }}
    >
      <Table>
        <thead>
          <tr>
            {headers.map((header, index) => {
              return (
                <th
                  key={index}
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
          {users.map((user, index) => {
            return (
              <BusinessUsersBodyRow
                key={index + index + user._id} // just for uniqueness
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

export default BusinessUsers
