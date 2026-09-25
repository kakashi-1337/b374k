import React from 'react'
import { format } from 'date-fns'
import {
  useMantineTheme,
  Title,
  Text,
  Group,
  Alert,
  Container,
  Stack,
  Box,
  Center
} from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons'
import { Button, Card } from 'components'
import formatBalance from 'helpers/format-balance'

const Step3 = ({
  type,
  batchPayResponse,
  inquiryData,
  totalAmount,
  setTotalAmount,
  totalUsers,
  username,
  primaryCurrency,
  setPouchUserRows,
  setBankAccountRows,
  setStep
}) => {
  const theme = useMantineTheme()

  const handleNewPayment = () => {
    setPouchUserRows([])
    setBankAccountRows([])
    setTotalAmount('0')
    setStep(1)
  }

  const renderSuccess = () => {
    const details = [
      { name: 'Transaction ID', value: inquiryData?._id },
      {
        name: 'Date & Time',
        value: format(
          new Date(
            inquiryData?.updatedAt || batchPayResponse?.updatedAt || Date.now()
          ),
          'MMMM dd, yyyy h:mm:ss aaa'
        )
      },
      { name: 'Account', value: username }
    ]
    return (
      <Box>
        <Stack align="center" my="xl">
          <Center
            style={{
              width: 80,
              height: 80,
              backgroundColor: theme.other[theme.colorScheme].success,
              borderRadius: theme.radius.max
            }}
          >
            <IconCheck size={40} color={theme.white} />
          </Center>
          <Title order={3}>Batch Payment Successful</Title>
          <Text weight={500} size="xl">
            Total of {formatBalance(totalAmount, primaryCurrency)} sent to{' '}
            {totalUsers} {type === 'pouch' ? 'users' : 'bank accounts'}
          </Text>
        </Stack>
        <Box my="xl">
          {details.map(({ name, value }) => (
            <Group key={name} position="apart">
              <Text weight={600}>{name}</Text>
              <Text>{value}</Text>
            </Group>
          ))}
        </Box>
        <Button
          mt="xl"
          radius="max"
          fullWidth
          size="lg"
          color="primary"
          onClick={handleNewPayment}
        >
          New Batch Payment
        </Button>
      </Box>
    )
  }

  const renderError = () => {
    const details = [
      {
        name: 'Date & Time',
        value: format(
          new Date(
            inquiryData?.updatedAt || batchPayResponse?.updatedAt || Date.now()
          ),
          'MMMM dd, yyyy h:mm:ss aaa'
        )
      },
      { name: 'Account', value: username }
    ]
    return (
      <Box>
        <Stack align="center" my="xl">
          <Center
            style={{
              width: 80,
              height: 80,
              backgroundColor: theme.other[theme.colorScheme].error,
              borderRadius: theme.radius.max
            }}
          >
            <IconX size={40} color={theme.white} />
          </Center>
          <Title order={3}>Batch Payment Failed</Title>
          {inquiryData?.failed ? (
            <Text size="md">
              Kindly check transactions for the failed transactions
            </Text>
          ) : null}
          <Alert title="Error" color="red">
            {inquiryData?.errorMessage || batchPayResponse?.data.error.message}
          </Alert>
        </Stack>
        <Box my="xl">
          {details.map(({ name, value }) => (
            <Group key={name} position="apart">
              <Text weight={600}>{name}</Text>
              <Text>{value}</Text>
            </Group>
          ))}
        </Box>
        <Text mt="xl" mb="md" align="center">
          Create a new batch payment to try again.
        </Text>
        <Button
          radius="max"
          fullWidth
          size="lg"
          color="primary"
          onClick={handleNewPayment}
        >
          New Batch Payment
        </Button>
      </Box>
    )
  }

  return (
    <Container size="sm">
      <Card>{inquiryData?.complete ? renderSuccess() : renderError()}</Card>
    </Container>
  )
}

export default Step3
