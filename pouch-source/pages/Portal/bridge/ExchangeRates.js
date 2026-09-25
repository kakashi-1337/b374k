import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import formatBalance from 'helpers/format-balance'
import { Text, TextInput, Center } from '@mantine/core'
import { Card, Table } from 'components'

const ExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [exchangeRatesError, setExchangeRatesError] = useState(null)
  const [exchangeRateSearch, setExchangeRateSearch] = useState('USD, PHP, CAD')

  const getUsers = () => {
    setLoading(true)
    axios
      .get('/api/v0/exchange-rates')
      .then((res) => {
        const rates = res.data.rates
        delete rates.BTC
        setExchangeRates(Object.entries(rates))
        setLoading(false)
      })
      .catch((err) => {
        setExchangeRatesError(
          err?.response?.message || 'error fetching exchange rates'
        )
        setLoading(false)
      })
  }

  useEffect(() => {
    getUsers()
  }, [])

  const data = useMemo(() => {
    if (!exchangeRates.length) return []
    const filteredExchangeRates = exchangeRates.filter(([code]) =>
      exchangeRateSearch
        .toLowerCase()
        .replaceAll(' ', '')
        .split(',')
        .includes(code.toLowerCase())
    )
    return filteredExchangeRates.map(
      ([currencyCode, rate]) => ({
        currencyCode,
        rate: formatBalance(rate, currencyCode)
      }),
      []
    )
  }, [exchangeRates, exchangeRateSearch])

  const columns = useMemo(
    () => [
      {
        Header: 'Currency Code',
        accessor: 'currencyCode'
      },

      {
        Header: 'BTC Rate',
        accessor: 'rate'
      }
    ],
    []
  )

  if (exchangeRatesError !== null) return <div>{exchangeRatesError}</div>
  return (
    <Card>
      <Text ta="center" weight="bold" size="xl">
        💸 Exchange Rates ({exchangeRates.length})
      </Text>
      <Center my="sm">
        <TextInput
          placeholder="Filter currency"
          value={exchangeRateSearch}
          onChange={(e) => setExchangeRateSearch(e.target.value)}
        />
      </Center>
      <Table
        data={data}
        columns={columns}
        striped
        height={120}
        loading={loading}
        pagination={false}
      />
    </Card>
  )
}

export default ExchangeRates
