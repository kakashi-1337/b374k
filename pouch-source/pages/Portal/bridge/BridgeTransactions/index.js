import { useState } from 'react'
import { Button, Box } from '@mantine/core'
import { List } from './List'
import { MoreFeatures } from './MoreFeatures'

export const BridgeTransactions = () => {
  const [tab, setTab] = useState('transactions')

  const handleTab = (value) => {
    setTab(value)
  }

  return (
    <Box>
      <Box mb="md">
        <Button
          variant={tab === 'transactions' ? 'filled' : 'default'}
          onClick={() => handleTab('transactions')}
        >
          Transactions
        </Button>
        <Button
          variant={tab === 'more' ? 'filled' : 'default'}
          onClick={() => handleTab('more')}
        >
          More features
        </Button>
      </Box>
      {tab === 'transactions' ? <List /> : null}
      {tab === 'more' ? <MoreFeatures /> : null}
    </Box>
  )
}
