import { useState } from 'react'
import {
  Text,
  Grid,
  TextInput,
  Select,
  Radio,
  Switch,
  createStyles
} from '@mantine/core'
import { Button, Card } from 'components'
import { useUserContext } from 'hooks/useUserContext'
import { useBanks } from 'hooks'
import axios from 'axios'

const ListItem = ({ label, children }) => {
  return (
    <>
      <Grid.Col sm={3}>
        <Text weight={600}>{label}</Text>
      </Grid.Col>
      <Grid.Col sm={9}>{children}</Grid.Col>
    </>
  )
}

const AutomaticWithdrawals = ({ user, isBridgeUser }) => {
  const MINIMUM_THRESHOLD = 16
  const MAXIMUM_THRESHOLD = 1_000_000
  const SWEEPING_FREQUENCY = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly'
  }
  const { banks, loading: loadingBanks } = useBanks()
  const { classes } = useStyles()

  const [recipientBankCode, setRecipientBankCode] = useState(
    user?.sweepConfig?.bankCode || ''
  )
  const [recipientAccountName, setRecipientAccountName] = useState(
    user?.sweepConfig?.accountName || ''
  )
  const [recipientAccountNumber, setRecipientAccountNumber] = useState(
    user?.sweepConfig?.accountNumber || ''
  )
  const [isSweeping, setIsSweeping] = useState(
    user?.sweepConfig?.useSweeping || false
  )
  const [frequency, setIsFrequency] = useState(
    user?.sweepConfig?.frequency || SWEEPING_FREQUENCY.monthly
  )
  const [threshold, setThreshold] = useState(
    user?.sweepConfig?.threshold || MINIMUM_THRESHOLD
  )

  const [isEdited, setIsEdited] = useState(false)
  const [thresholdErrorMessage, setThresholdErrorMessage] = useState('')
  const [loadingSave, setLoadingSave] = useState(false)

  const handleRecipientBankCode = (bankCode) => {
    if (bankCode === recipientBankCode) return

    setRecipientBankCode(bankCode)
    setIsEdited(true)
  }

  const handleAccountName = (event) => {
    setRecipientAccountName(event.target.value)
    setIsEdited(true)
  }

  const handleAccountNumber = (event) => {
    setRecipientAccountNumber(event.target.value)
    setIsEdited(true)
  }

  const handleIsSweeping = async (event) => {
    setIsSweeping(event.currentTarget.checked)
    try {
      if (isBridgeUser) {
        await axios.put(`/api/v3/bridge/users/${user._id}/config/sweep`, {
          useSweeping: event.currentTarget.checked,
          bankCode: recipientBankCode,
          accountName: recipientAccountName,
          accountNumber: recipientAccountNumber,
          frequency: frequency,
          threshold: threshold,
          username: user.username
        })
      } else {
        await axios.put('/api/v3/users/config/sweep', {
          useSweeping: event.currentTarget.checked,
          bankCode: recipientBankCode,
          accountName: recipientAccountName,
          accountNumber: recipientAccountNumber,
          frequency: frequency,
          threshold: threshold
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleFrequency = (value) => {
    setIsFrequency(value)
    setIsEdited(true)
  }

  const handleThreshold = (event) => {
    const threshold = event.target.value
    if (isThresholdWithinMinAndMaxAmount(threshold)) {
      setThresholdErrorMessage('')
    } else {
      setThresholdErrorMessage(
        `Must be between ${MINIMUM_THRESHOLD} and ${MAXIMUM_THRESHOLD}`
      )
    }

    setThreshold(threshold)
    setIsEdited(true)
  }

  const handleSave = async () => {
    try {
      setLoadingSave(true)
      if (isBridgeUser) {
        await axios.put(`/api/v3/bridge/users/${user._id}/config/sweep`, {
          useSweeping: isSweeping,
          bankCode: recipientBankCode,
          accountName: recipientAccountName,
          accountNumber: recipientAccountNumber,
          frequency: frequency,
          threshold: threshold,
          user: user.username
        })
      } else {
        await axios.put('/api/v3/users/config/sweep', {
          useSweeping: isSweeping,
          bankCode: recipientBankCode,
          accountName: recipientAccountName,
          accountNumber: recipientAccountNumber,
          frequency: frequency,
          threshold: threshold
        })
      }

      setIsEdited(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingSave(false)
    }
  }

  const isThresholdWithinMinAndMaxAmount = (threshold) => {
    const parseThreshold = Number(threshold)
    return (
      parseThreshold >= MINIMUM_THRESHOLD && parseThreshold <= MAXIMUM_THRESHOLD
    )
  }

  const areInputsValid = () => {
    if (!recipientAccountName || !recipientAccountNumber || !recipientBankCode)
      return false

    if (!isThresholdWithinMinAndMaxAmount(threshold)) return false

    return true
  }

  const shouldSaveButtonBeDisabled = () => {
    if (!areInputsValid()) return true

    if (!isEdited) return true

    return false
  }

  const renderHeader = () => {
    return (
      <div className={classes.header}>
        <Text size="lg" weight={700}>
          Automatic Withdrawals
        </Text>
        <Switch checked={isSweeping} onChange={handleIsSweeping} />
      </div>
    )
  }

  const renderLoadIcon = () => {
    return <div className="loader" />
  }

  const renderInputs = () => {
    return (
      <Grid align="center" mt={28}>
        <ListItem label="Bank">
          <Select
            value={recipientBankCode}
            onChange={handleRecipientBankCode}
            sx={{ flex: 1 }}
            placeholder="Select Bank"
            data={banks.map((bank) => {
              return { value: bank.brstn, label: bank.bankName }
            })}
          />
        </ListItem>
        <ListItem label="Account Name">
          <TextInput
            value={recipientAccountName}
            onChange={handleAccountName}
            placeholder="Account Name"
            withAsterisk
          />
        </ListItem>
        <ListItem label="Account Number">
          <TextInput
            value={recipientAccountNumber}
            onChange={handleAccountNumber}
            type="number"
            placeholder="Account Number"
            withAsterisk
          />
        </ListItem>
        <ListItem label="Withdrawal Frequency">
          <Radio.Group
            withAsterisk
            value={frequency}
            onChange={handleFrequency}
          >
            <Radio value={SWEEPING_FREQUENCY.daily} label="Daily" />
            <Radio value={SWEEPING_FREQUENCY.weekly} label="Weekly" />
            <Radio value={SWEEPING_FREQUENCY.monthly} label="Monthly" />
          </Radio.Group>
        </ListItem>
        <ListItem label="Threshold">
          <TextInput
            error={thresholdErrorMessage}
            min={MINIMUM_THRESHOLD}
            max={MAXIMUM_THRESHOLD}
            value={threshold}
            onChange={handleThreshold}
            type="number"
            placeholder="Amount"
            withAsterisk
          />
        </ListItem>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button
            onClick={handleSave}
            disabled={shouldSaveButtonBeDisabled()}
            mr={10}
            mt={10}
          >
            Save
          </Button>
        </div>
      </Grid>
    )
  }

  return (
    <Card mt="md" title={renderHeader()}>
      {isSweeping
        ? loadingSave || loadingBanks
          ? renderLoadIcon()
          : renderInputs()
        : null}
    </Card>
  )
}

const useStyles = createStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}))

export default AutomaticWithdrawals
