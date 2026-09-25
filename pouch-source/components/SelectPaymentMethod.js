import React, { useState, useEffect, forwardRef } from 'react'
import axios from 'axios'
import { Select, Group, Image, Text, List } from '@mantine/core'

const SelectItem = forwardRef(
  ({ value, descriptions, logo, currency, fee, maxAmount, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group position='apart'>
        <Image src={logo} width={100} height={60} fit='contain' />
        <Text weight={500}>{currency} {fee}</Text>
      </Group>
      <List>
        {descriptions.length > 0
          ? descriptions.map((desc, i) => (
            <List.Item key={`${value}-${i}`}>{desc}</List.Item>
          ))
          : null}
        <List.Item>Transfer limit: {currency} {maxAmount}</List.Item>
      </List>
    </div>
  )
)
SelectItem.displayName = 'SelectItem'

const SelectPaymentMethod = ({ getPaymentMethodsData = () => {}, loading, options = [], ...others }) => {
  const [data, setData] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [isLoading, setIsLoading] = useState(loading || false)

  useEffect(() => {
    (async () => {
      setIsLoading(true)
      try {
        const res = await axios.get('/api/v0/bank/payment-methods')
        const paymentMethods = res.data.reduce((prev, curr) => {
          return [...prev, {
            key: curr.type,
            value: curr.type,
            label: curr.name,
            descriptions: curr.descriptions,
            logo: curr.logo,
            currency: curr.fee_amount.currency,
            fee: curr.fee_amount.value,
            maxAmount: curr.limits.maximum.value
          }]
        }, [])
        setPaymentMethods(paymentMethods)
        getPaymentMethodsData(res.data)
        setIsLoading(false)
      } catch (err) {
        alert('An error occured while loading payment methods. Please refresh to try again.')
      }
    })()
    return () => {
      setPaymentMethods([])
    }
  }, [])

  useEffect(() => {
    if (paymentMethods.length > 0 && options.length > 0) {
      const data = paymentMethods.filter(el => options.includes(el.value))
      setData(data)
    }
  }, [options])

  return (
    <Select
      label='Send via'
      placeholder={isLoading ? 'Loading...' : 'Select Payment Method'}
      itemComponent={SelectItem}
      data={data}
      maxDropdownHeight={400}
      nothingFound='Not found'
      disabled={isLoading}
      {...others}
    />
  )
}

export default SelectPaymentMethod
