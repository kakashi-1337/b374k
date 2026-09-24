import React, { useState } from 'react'
import { Box, Tabs, Text, createStyles } from '@mantine/core'
import Applications from './applications/Applications'
import UserActivities from './UserActivities'
import UserManagement from './user-management/UserManagement'
import AuditTrails from './audit-trails/AuditTrails'
import MigrationApplications from './migration-applications/MigrationApplications'

const tabs = [
  // { label: 'Overview', value: '/overview' },
  { label: 'Applications', value: '/applications' },
  { label: 'Migration Applications', value: '/migration-applications' },
  // { label: 'User Activities', value: '/user-activities' },
  { label: 'User Management', value: '/user-management' },
  { label: 'Audit Trails', value: '/audit-trails' }
]

const KYCDashboard = () => {
  const { classes } = useStyles()
  const [activeTab, setActiveTab] = useState('/applications')

  return (
    <Tabs
      value={activeTab}
      onTabChange={setActiveTab}
      styles={() => ({
        tab: classes.tabStyle
      })}
    >
      <Tabs.List grow position="center" className={classes.tabsListStyle}>
        {tabs.map((tab) => {
          return (
            <Tabs.Tab
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              value={tab.value}
            >
              <Box className={classes.tabBoxStyle}>
                <Text
                  style={{
                    color: activeTab === tab.value ? '#6922FF' : '#777777',
                    fontWeight: activeTab === tab.value ? 700 : 500
                  }}
                >
                  {tab.label}
                </Text>
                {/* {tab.value === '/applications' && (
                  <Text className={classes.applicationsIndicatorStyle}>
                    {forReviewData.total}
                  </Text>
                )} */}
              </Box>
            </Tabs.Tab>
          )
        })}
      </Tabs.List>

      {/* {activeTab === '/overview' ? <Home /> : null} */}
      {activeTab === '/applications' ? <Applications /> : null}
      {activeTab === '/migration-applications' ? (
        <MigrationApplications />
      ) : null}
      {activeTab === '/user-activities' ? <UserActivities /> : null}
      {activeTab === '/user-management' ? <UserManagement /> : null}
      {activeTab === '/audit-trails' ? <AuditTrails /> : null}
    </Tabs>
  )
}

const useStyles = createStyles((theme) => ({
  loaderStyle: {
    display: 'flex',
    minHeight: '80vh',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabStyle: {
    paddingBottom: 20,
    paddingTop: 20,
    borderWidth: 4,
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  tabsListStyle: {
    backgroundColor: '#fff',
    borderRadius: 10
  },
  tabBoxStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  applicationsIndicatorStyle: {
    fontSize: 12,
    backgroundColor: '#6922FF',
    height: 14,
    width: 14,
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    color: '#fff',
    fontWeight: 500
  }
}))

export default KYCDashboard
