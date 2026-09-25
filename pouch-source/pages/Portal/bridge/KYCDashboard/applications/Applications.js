import React, { useState, useEffect } from 'react'
import useApplications from '../hooks/useApplications'
import {
  Box,
  Select,
  Skeleton,
  Text,
  Group,
  TextInput,
  Tooltip,
  createStyles,
} from '@mantine/core'
import Tab from './Tab'
import UsersTable from './UsersTable'
import { IconChevronLeft, IconChevronRight, IconRefresh } from '@tabler/icons'

const tabs = [
  { label: 'For Review', value: 'FOR_REVIEW' },
  { label: 'Pending', value: 'PENDING', disabled: true },
  { label: 'For Retake - Netbank', value: 'RETAKE_NETBANK', disabled: true },
  { label: 'For Retake - Pouch', value: 'RETAKE_POUCH' },
  { label: 'Failed', value: 'FAILED', disabled: true },
  { label: 'Completed', value: 'COMPLETED', disabled: true },
]

const noUsersMessages = {
  FOR_REVIEW: 'No applications for review.',
  PENDING: 'No pending applications.',
  RETAKE_NETBANK: 'No applications for retake.',
  RETAKE_POUCH: 'No applications for retake.',
  FAILED: 'No failed applications.',
  COMPLETED: 'No completed applications.',
}

const DEFAULT_LIMIT = 50
const DEFAULT_PAGE = 1

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

const Applications = () => {
  const { classes } = useStyles()
  const [activeTab, setActiveTab] = useState('FOR_REVIEW')
  const [searchText, setSearchText] = useState('')
  const debouncedsearchText = useDebounce(searchText, 500)

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)
  const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT)
  const { users, loading, refetchUsers, error, metadata } = useApplications(
    activeTab,
    currentPage,
    currentLimit,
    debouncedsearchText,
  )

  return (
    <>
      <Box className={classes.tabsContainer}>
        {tabs.map((tab) => {
          return (
            <Tab
              disabled={!!tab.disabled}
              key={tab.value}
              isActive={tab.value === activeTab}
              title={tab.label}
              onClick={() => {
                if (tab.disabled) {
                  return
                }
                setActiveTab(tab.value)
              }}
            />
          )
        })}
      </Box>
      <Group justify="space-between">
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
        />
        <Tooltip label="Refresh">
          <Box
            onClick={refetchUsers}
            style={{
              width: 'fit-content',
              backgroundColor: '#fff',
              marginTop: 20,
              borderRadius: 10,
              border: '1px solid #6922FF',
              cursor: 'pointer',
            }}
          >
            <IconRefresh
              size={18}
              style={{
                color: '#6922FF',
                padding: '10px 10px 6px 10px',
              }}
            />
          </Box>
        </Tooltip>
      </Group>
      {loading ? (
        <Skeleton height={400} width="100%" mt={20} />
      ) : error ? (
        <Text mt={20} weight={500} style={{ fontStyle: 'italic' }}>
          Something went wrong.
        </Text>
      ) : (
        <>
          {users.length === 0 ? (
            <Text mt={20} weight={500} style={{ fontStyle: 'italic' }}>
              {noUsersMessages[activeTab]}
            </Text>
          ) : (
            <UsersTable
              activeTab={activeTab}
              users={users}
              refetchUsers={refetchUsers}
            />
          )}
        </>
      )}
      <Box
        sx={{
          display: 'flex',
          gap: 20,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Box>
          <Select
            defaultValue="50"
            value={currentLimit}
            data={[
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '50', value: 50 },
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
              color: currentPage === metadata.pages ? '#CCCCCC' : '#6922FF',
            }}
          />
        </Box>
      </Box>
    </>
  )
}

const useStyles = createStyles(() => ({
  tabsContainer: {
    marginTop: 50,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
  },
}))

export default Applications
