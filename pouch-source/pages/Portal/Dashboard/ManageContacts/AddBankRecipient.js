import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { Button, TextInput, Input } from '@mantine/core'
import { useForm } from '@mantine/form'
import Card from 'components/Card'
import SelectBankDropdown from 'components/SelectBankDropdown'
import BackButton from 'components/BackButton'

const AddBankRecipient = ({ user }) => {
  const history = useHistory()
  const [bankList, setBankList] = useState([])
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      bank: null, // { bankName: '', bankCode: {} }
      accountName: '',
      accountNumber: ''
    },
    validationRules: {
      bank: (value) => value !== null,
      accountName: (value) => value.length,
      accountNumber: (value) => value.length
    },
    errorMessages: {
      bank: 'Bank is required',
      accountName: 'Account name is required',
      accountNumber: 'Account number is required'
    }
  })

  const handleBack = () => history.replace('/dashboard/manage-contacts')

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true)
    const { bank, accountName, accountNumber } = values
    const bankValue = bankList.find(el => el.bankName === bank)
    const type = bankValue.types[0]
    const body = {
      type,
      accountName,
      accountNumber
    }
    if (bankValue.bankCode[type]) {
      body.bankCode = bankValue.bankCode[type]
    }
    try {
      const res = await axios.post(`/api/v0/bank/recipients?activeProfileUsername=${user.username}`, body)
      if (res) {
        handleBack()
      }
    } catch (err) {
      alert('Error adding recipient. Please try again.')
      setLoading(false)
    }
  })

  // This will only allow numbers for number input type
  const handleKeyDownChange = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

  return (
    <>
      <BackButton onClick={handleBack} />
      <Card mt='xs' title='Add Bank Recipient'>
        <form onSubmit={handleSubmit}>
          <Input.Wrapper size='md' error={form.values.bank && form.errors.bank}>
            <SelectBankDropdown
              size='md'
              disabled={loading}
              getBankListData={setBankList}
              {...form.getInputProps('bank')}
            />
          </Input.Wrapper>
          <TextInput
            mt='md'
            size='md'
            label='Account Name'
            placeholder='Enter account name'
            disabled={loading}
            {...form.getInputProps('accountName')}
          />
          <TextInput
            mt='md'
            size='md'
            label='Account Number'
            placeholder='Enter account number'
            disabled={loading}
            {...form.getInputProps('accountNumber')}
            onKeyDown={handleKeyDownChange}
            type='number'
          />
          <Button mt='lg' type='submit' loading={loading}>Add Recipient Details</Button>
        </form>
      </Card>
    </>
  )
}

export default AddBankRecipient
