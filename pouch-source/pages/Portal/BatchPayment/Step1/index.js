import { useEffect, useState } from 'react'
import { Text, Group, Grid, Divider, Alert, Loader } from '@mantine/core'
import { Button, Card } from 'components'
import formatBalance from 'helpers/format-balance'
import PouchUserBatchTable from './PouchUserBatchTable'
import BankAccountBatchTable from './BankAccountBatchTable'
import Instructions from './Instructions'
import Tabs from './Tabs'

const isReadClipboardSupported = 'readText' in navigator.clipboard

const Detail = ({ name, value }) => {
  return (
    <Group my="md" position="apart">
      <Text weight={700}>{name}</Text>
      {value}
    </Group>
  )
}

const Step1 = ({
  user,
  activeTab,
  setActiveTab,
  pouchUserRows,
  setPouchUserRows,
  bankAccountRows,
  setBankAccountRows,
  setStep,
  totalAmount,
  setTotalAmount
}) => {
  const [tableError, setTableError] = useState('')
  const [paymentDetailsError, setPaymentDetailsError] = useState('')
  const [isTotalAmountLoading, setIsTotalAmountLoading] = useState(false)
  const [didMount, setDidMount] = useState(false)

  useEffect(() => {
    setDidMount(true)
    calculateTotalAmount()
    return () => {
      setDidMount(false)
    }
  }, [activeTab, pouchUserRows, bankAccountRows])

  useEffect(() => {
    const rows = activeTab === 0 ? pouchUserRows : bankAccountRows
    if (rows.length > 0) {
      validateBalanceToAmount(totalAmount)
    }
    validateBalanceToAmount(totalAmount)
  }, [totalAmount])

  // Checks if current profile balance is enough for payment
  const validateBalanceToAmount = (amount) => {
    const isBalanceSufficient = user.balances[user.primaryCurrency] > amount
    setPaymentDetailsError(isBalanceSufficient ? '' : 'Insufficient balance')
  }

  const calculateTotalAmount = async () => {
    setIsTotalAmountLoading(true)

    const rows = activeTab === 0 ? pouchUserRows : bankAccountRows

    let sum = 0
    for (let i = 0; i < rows.length; i++) {
      const { amount } = rows[i]
      if (amount > 0 && amount < Number.MAX_SAFE_INTEGER) {
        sum += amount
      } else {
        setTotalAmount(0)
        setTableError('Invalid amount found in one of the entries')
        setIsTotalAmountLoading(false)
        return
      }
    }

    setTableError('')
    if (sum === totalAmount) {
      // This is to execute the validateBalanceToAmount function if the previous total amount is the same
      validateBalanceToAmount(totalAmount)
    } else {
      setTotalAmount(sum)
      setPaymentDetailsError('')
    }
    setIsTotalAmountLoading(false)
  }

  const availableBalance = formatBalance(
    user.balances[user.primaryCurrency],
    user.primaryCurrency
  )

  if (!didMount) return null

  return (
    <>
      <Instructions />
      <Grid>
        <Grid.Col sm={12} md={8}>
          <Card>
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === 0 ? (
              <PouchUserBatchTable
                isReadClipboardSupported={isReadClipboardSupported}
                pouchUserRows={pouchUserRows}
                setPouchUserRows={setPouchUserRows}
              />
            ) : (
              <BankAccountBatchTable
                isReadClipboardSupported={isReadClipboardSupported}
                bankAccountRows={bankAccountRows}
                setBankAccountRows={setBankAccountRows}
              />
            )}
          </Card>
        </Grid.Col>
        <Grid.Col sm={12} md={4}>
          <Card title="Payment Details" sx={{ height: '100%' }}>
            <Detail
              name="Balance"
              value={
                isTotalAmountLoading ? (
                  <Loader size="sm" />
                ) : (
                  <Text weight={700}>{availableBalance}</Text>
                )
              }
            />
            <Detail
              name={activeTab === 0 ? 'Users' : 'Recipients'}
              value={
                <Text weight={700}>
                  {activeTab === 0
                    ? pouchUserRows.length
                    : bankAccountRows.length}
                </Text>
              }
            />
            <Divider />
            <Detail
              name="Total Amount"
              value={
                isTotalAmountLoading ? (
                  <Loader size="sm" />
                ) : (
                  <Text weight={700}>
                    {formatBalance(totalAmount, user.primaryCurrency)}
                  </Text>
                )
              }
            />
            {paymentDetailsError.length > 0 ? (
              <Alert my="xl" title={paymentDetailsError} color="red" />
            ) : null}
            <Button
              size="lg"
              disabled={
                isTotalAmountLoading || activeTab === 0
                  ? pouchUserRows.length === 0
                  : bankAccountRows.length === 0 ||
                    tableError.length > 0 ||
                    paymentDetailsError.length > 0
              }
              fullWidth
              onClick={() => setStep(2)}
              radius="max"
            >
              Continue
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  )
}
export default Step1
