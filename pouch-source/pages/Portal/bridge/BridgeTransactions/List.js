import React, { useState } from 'react'
import { Box, Text, Button, Group, Modal, ScrollArea } from '@mantine/core'
import { Card } from 'components'
import Transactions from '../../Transactions'

const transactionTypes = [
  {
    label: 'Bank Transfer',
    value: 'BANK_TRANSFER',
  },
  {
    label: 'Lightning and On-chain',
    value: 'LIGHTNING_AND_ONCHAIN',
  },
  {
    label: 'High Risk',
    value: 'HIGH_RISK',
  },
  {
    label: 'Send Globally',
    value: 'SEND_GLOBALLY',
  },
]

export const List = () => {
  const [viewTx, setViewTx] = useState(null)
  const [type, setType] = useState('')

  const handleType = (value) => {
    setType(type === value ? '' : value)
  }

  return (
    <Box>
      <Modal
        size="lg"
        opened={viewTx}
        onClose={() => setViewTx(null)}
        title={`Transaction ${viewTx?._id}`}
      >
        <ScrollArea type="always">
          <Text size="lg">
            <pre>{JSON.stringify(viewTx, null, 2)}</pre>
          </Text>
        </ScrollArea>
      </Modal>
      <Card mb="md">
        <Text mb="sm" size="lg" weight="bold">
          Filter by type:
        </Text>
        <Group>
          {transactionTypes.map((data, index) => {
            return (
              <Button
                key={index}
                variant={type === data.value ? 'filled' : 'default'}
                onClick={() => handleType(data.value)}
                // Temporary
                disabled={data.value === 'HIGH_RISK'}
              >
                {data.label}
              </Button>
            )
          })}
        </Group>
      </Card>
      <Transactions isBridge={true} type={type} />
    </Box>
  )
}
