import { useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import {
  Text,
  Group,
  Stack,
  Title,
  Box,
  Container,
  Progress
} from '@mantine/core'
import { IconArrowNarrowLeft } from '@tabler/icons'
import { Button, Card } from 'components'
import formatBalance from 'helpers/format-balance'

const Step2 = ({
  type,
  rows,
  totalAmount,
  setStep,
  username,
  primaryCurrency,
  setBatchPayResponse,
  setInquiryData
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleBack = () => setStep(1)

  const handleInquiry = async () => {
    // Check batch payment transaction
    const interval = setInterval(async () => {
      const { data } = await axios.get(`/api/v0/transaction/batch-payment`, {
        params: { sender: username }
      })

      const progress = (
        (data.completedTransactionIds.length / data.requestPayload.length) *
        100
      ).toFixed(0)
      setProgress(progress)

      if (data.complete || data.failed) {
        clearInterval(interval)
        setInquiryData(data)
        // Add a delay to show progress bar completion
        setTimeout(() => {
          setIsLoading(false)
          setStep(3)
        }, 500)
      }
    }, 3000)
  }

  const handleConfirm = async () => {
    setIsLoading(true)

    // Execute batch payment
    try {
      const data = rows // [{ username: 'string', amount: 100, currency: 'PHP' }]
      const res = await axios.post(`/api/v0/transaction/batch-payment/${type}`, data)
      setBatchPayResponse(res.data)
      await handleInquiry()
    } catch (err) {
      setBatchPayResponse(err.response)
      setIsLoading(false)
      setStep(3)
    }
  }

  const renderConfirmation = () => {
    const details = [
      {
        name: 'Date & Time',
        value: format(Date.now(), 'MMMM dd, yyyy h:mm:ss aaa')
      },
      { name: 'Account', value: username }
    ]
    return (
      <Box>
        <Stack align="center">
          <Title order={3}>Confirmation</Title>
          <Text size="lg">You are about to send a total of</Text>
          <Title order={2}>{formatBalance(totalAmount, primaryCurrency)}</Title>
          <Text size="lg">to</Text>
          <Title order={4}>{rows.length} users</Title>
        </Stack>
        <Box py="xl">
          {details.map(({ name, value }) => (
            <Group key={name} position="apart">
              <Text weight={600}>{name}</Text>
              <Text>{value}</Text>
            </Group>
          ))}
        </Box>
        <Button size="lg" fullWidth onClick={handleConfirm} radius="max">
          Confirm
        </Button>
      </Box>
    )
  }

  const renderProcessing = () => {
    const details = [
      { name: 'Date', value: format(Date.now(), 'MMMM dd, yyyy') },
      { name: 'Account', value: username },
      { name: 'Users', value: rows.length },
      {
        name: 'Total Amount',
        value: formatBalance(totalAmount, primaryCurrency)
      }
    ]
    return (
      <Box>
        <Stack align="center">
          <Title order={6}>Processing Batch Payment</Title>
          <Title mb="md" mt="xl" order={2}>
            {progress}%
          </Title>
          <Progress value={progress} />
          <Text size="md">
            Your batch payment is started and should be completed momentarily.
            This page will refresh automatically with progress
          </Text>
        </Stack>
        <Box py="xl">
          {details.map(({ name, value }) => (
            <Group key={name} position="apart">
              <Text weight={600}>{name}</Text>
              <Text>{value}</Text>
            </Group>
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Container size="xs">
      {isLoading ? null : (
        <Button
          onClick={handleBack}
          leftIcon={<IconArrowNarrowLeft />}
          variant="transparent"
        >
          Back
        </Button>
      )}
      <Card>{isLoading ? renderProcessing() : renderConfirmation()}</Card>
    </Container>
  )
}

export default Step2
