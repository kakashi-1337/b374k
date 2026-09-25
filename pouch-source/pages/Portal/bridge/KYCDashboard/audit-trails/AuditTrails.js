import React, { useState } from 'react'
import useAuditTrails from '../hooks/useAuditTrails'
import {
  Box,
  Skeleton,
  Table,
  Text,
  Tooltip,
  createStyles
} from '@mantine/core'
import Tab from './Tab'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import { IconRefresh } from '@tabler/icons'

const tabs = [
  { label: 'Today', value: 'TODAY' },
  { label: 'This Week', value: 'THIS_WEEK' },
  { label: 'This Month', value: 'THIS_MONTH' },
  { label: 'This Year', value: 'THIS_YEAR' }
  // { label: 'All', value: 'ALL' }
]

const AuditTrails = ({ rootTab }) => {
  const { classes } = useStyles()
  const [activeTab, setActiveTab] = useState('TODAY')
  const { auditTrails, loading, refetchAuditTrails } = useAuditTrails(activeTab)

  return (
    <>
      <Box className={classes.tabsContainer}>
        {tabs.map((tab) => {
          return (
            <Tab
              key={tab.value}
              isActive={tab.value === activeTab}
              title={tab.label}
              onClick={() => {
                setActiveTab(tab.value)
              }}
            />
          )
        })}
      </Box>
      <Tooltip label="Refresh">
        <Box
          onClick={refetchAuditTrails}
          style={{
            width: 'fit-content',
            backgroundColor: '#fff',
            marginTop: 20,
            borderRadius: 10,
            border: '1px solid #6922FF',
            cursor: 'pointer'
          }}
        >
          <IconRefresh
            size={18}
            style={{ color: '#6922FF', padding: '10px 10px 6px 10px' }}
          />
        </Box>
      </Tooltip>

      {loading ? (
        <Skeleton height={400} width="100%" mt={20} />
      ) : (
        <Box className={classes.tableContainer}>
          {auditTrails.length === 0 ? (
            <Text weight={700} mt={40}>
              No available audit trails
            </Text>
          ) : (
            <Table className={classes.table}>
              <TableHeader />
              <TableBody data={auditTrails} />
            </Table>
          )}
        </Box>
      )}
    </>
  )
}

const useStyles = createStyles(() => ({
  tableContainer: {
    overflow: 'auto',
    maxHeight: '60vh',
    marginTop: 20
  },
  table: {
    borderSpacing: 0
  },
  tabsContainer: {
    marginTop: 50,
    display: 'flex',
    gap: 20
  }
}))

export default AuditTrails
