import { Box, Grid, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons'
import React, { useState } from 'react'
import BusinessList from './BusinessList'
import useBusiness from './useBusiness'

const Businesses = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { businesses, loading } = useBusiness()
  const filteredBusinesses = businesses.filter((business) =>
    business.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box>
      <Grid pt={10} pb={10}>
        <Grid.Col span={8}>
          <TextInput
            size="md"
            placeholder="Search Username"
            icon={<IconSearch />}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Grid.Col>
      </Grid>
      {loading ? (
        <div className="loader" />
      ) : (
        <BusinessList businesses={filteredBusinesses} />
      )}
    </Box>
  )
}

export default Businesses
