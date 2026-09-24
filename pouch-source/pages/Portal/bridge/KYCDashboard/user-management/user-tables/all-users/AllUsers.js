import { Box, Table } from '@mantine/core'
import React from 'react'
import AllUsersBodyRow from './AllUsersBodyRow'

const headers = ['', 'Username', 'Name', 'Contact', 'Balance', '']

const AllUsers = ({ users, refetchUsers }) => {
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
          {users.map((user) => {
            return (
              <AllUsersBodyRow
                key={user._id}
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

export default AllUsers
