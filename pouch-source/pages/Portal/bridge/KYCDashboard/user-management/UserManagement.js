import {
  Box,
  Button,
  Select,
  Skeleton,
  Text,
  TextInput,
  createStyles
} from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { IconAt, IconChevronLeft, IconChevronRight } from '@tabler/icons'
import Tab from './Tab'
import useUserManagement from '../hooks/useUserManagement'
import AllUsers from './user-tables/all-users/AllUsers'
import ApprovedUsers from './user-tables/approved-users/ApprovedUsers'
import BannedUsers from './user-tables/banned-users/BannedUsers'
import BusinessUsers from './user-tables/business-users/BusinessUsers'
import SpecificUsers from './user-tables/specific-user/SpecificUsers'

const tabs = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Approved Users', value: 'APPROVED' },
  { label: 'Approved Businesses', value: 'APPROVED_BUSINESS' },
  { label: 'Banned Users', value: 'BANNED' }
]

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const DEFAULT_LIMIT = 50
const DEFAULT_PAGE = 1

const UserManagement = () => {
  const { classes } = useStyles()
  const [searchText, setSearchText] = useState('')
  const debouncedsearchText = useDebounce(searchText, 500)

  const [activeTab, setActiveTab] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
  const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT)
  const { loading, error, users, refetchUsers, metadata } = useUserManagement({
    currentPage,
    currentLimit,
    category: activeTab,
    searchText: debouncedsearchText
  })

  return (
    <Box>
      <Box className={classes.inputsContainer}>
        <TextInput
          value={searchText}
          onChange={(event) => {
            setSearchText(event.currentTarget.value)
            setCurrentLimit(DEFAULT_LIMIT)
            setCurrentPage(DEFAULT_PAGE)
          }}
          label="Search Username or Mobile Number or Email"
          description="Phone number should start with +63"
          placeholder="e.g juandelacruz, +639123456789, name@email.com"
          mt={20}
          style={{ width: '30%' }}
        />
      </Box>

      <Box className={classes.tabsContainer}>
        {tabs.map((tab) => {
          return (
            <Tab
              key={tab.value}
              isActive={tab.value === activeTab}
              title={tab.label}
              onClick={() => {
                setActiveTab(tab.value)
                setSearchText('')
                setCurrentLimit(DEFAULT_LIMIT)
                setCurrentPage(DEFAULT_PAGE)
              }}
            />
          )
        })}
      </Box>

      {loading ? (
        <Skeleton height={400} width="100%" mt={20} />
      ) : error ? (
        <Text weight={700} mt={20}>
          Something went wrong.
        </Text>
      ) : (
        <>
          {users.length === 0 ? (
            <Text mt={20} weight={700}>
              No users
            </Text>
          ) : (
            <>
              {activeTab === '' ? (
                <SpecificUsers
                  users={users}
                  refetchUsers={() => {
                    refetchUsers({ category: '', page: 1 })
                  }}
                />
              ) : null}
              {activeTab === 'ALL' ? (
                <AllUsers
                  users={users}
                  refetchUsers={() => {
                    refetchUsers({ category: 'ALL', page: 1 })
                  }}
                />
              ) : null}
              {activeTab === 'APPROVED' ? (
                <ApprovedUsers
                  users={users}
                  refetchUsers={() => {
                    refetchUsers({ category: 'APPROVED', page: 1 })
                  }}
                />
              ) : null}
              {activeTab === 'BANNED' ? (
                <BannedUsers
                  users={users}
                  refetchUsers={() => {
                    refetchUsers({ category: 'BANNED', page: 1 })
                  }}
                />
              ) : null}
              {activeTab === 'APPROVED_BUSINESS' ? (
                <BusinessUsers users={users} refetchUsers={refetchUsers} />
              ) : null}
            </>
          )}
        </>
      )}
      <Box
        sx={{
          display: 'flex',
          gap: 20,
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        <Box>
          <Select
            defaultValue="50"
            value={currentLimit}
            data={[
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '50', value: 50 }
            ]}
            onChange={(value) => setCurrentLimit(value)}
          />
        </Box>
        <Box
          disabled={currentPage === 1}
          onClick={() => {
            if (currentPage === 1) return

            setCurrentPage((prevState) => prevState - 1)
          }}
          style={{ backgroundColor: 'transparent', cursor: 'pointer' }}
        >
          <IconChevronLeft
            style={{ color: currentPage === 1 ? '#CCCCCC' : '#6922FF' }}
          />
        </Box>
        <Box
          disabled={currentPage === metadata.pages}
          onClick={() => {
            if (currentPage === metadata.pages) return

            setCurrentPage((prevState) => prevState + 1)
          }}
          style={{ backgroundColor: 'transparent', cursor: 'pointer' }}
        >
          <IconChevronRight
            style={{
              color: currentPage === metadata.pages ? '#CCCCCC' : '#6922FF'
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

const useStyles = createStyles(() => ({
  tabsContainer: {
    marginTop: 50,
    display: 'flex',
    gap: 20
  },
  tableContainer: {
    overflow: 'scroll',
    marginTop: 30
  },
  table: {
    borderCollapse: 'separate',
    borderSpacing: 0
  },
  inputsContainer: {
    display: 'flex',
    gap: 10
  },
  searchButton: {
    alignSelf: 'flex-end'
  }
}))

export default UserManagement
