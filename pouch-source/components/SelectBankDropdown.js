import React, { useState, useEffect } from 'react'
import { Select } from '@mantine/core'
import { useBanks } from 'hooks'

const SelectBankDropdown = ({ getBankListData = () => {}, loading, ...others }) => {
  const [data, setData] = useState([])
  const {banks, loading:isLoading} = useBanks()

  useEffect(() => {
    const data = banks.reduce((prev, curr, index) => {
      return [...prev, {
        key: index,
        label: curr.bankName,
        value: curr.bankName
      }]
    }, [])

    console.log(data)
    setData(data)
    getBankListData(banks)
  
    return () => {
      setData([])
    }
  }, [isLoading])

  return (
    <Select
      label='Bank'
      placeholder={isLoading ? 'Loading...' : 'Select Bank'}
      data={data}
      maxDropdownHeight={400}
      nothingFound='Not found'
      {...others}
      disabled={isLoading}
    />
  )
}

export default SelectBankDropdown
