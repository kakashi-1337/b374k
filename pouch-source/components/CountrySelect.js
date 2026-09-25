import React, { useEffect, useState } from 'react'
import { Group, Text, Select, Image, Card } from '@mantine/core'
import { countries } from 'countries-list'
import philippinesFlag from 'assets/images/philippines-flag.png'
import elSalvadorFlag from 'assets/images/el-salvador-flag.png'

const CountryCard = ({ img, countryName, selected, countryCode, children, onChange }) => {
  return (
    <Card className={`country-card ${onChange ? 'clickable' : ''} ${selected === countryCode ? 'active' : ''}`} onClick={onChange ? () => onChange(countryCode) : undefined}>
      <Image src={img} width='40px' />
      <div style={{ paddingLeft: '16px', width: '160px', flexShrink: 0 }}>
        <Text size='md'>I&apos;m From</Text>
        <Text size='xl' weight='bold'>{countryName}</Text>
      </div>
      {children}
    </Card>
  )
}

const SelectItem = React.forwardRef(
  ({ flagEmoji, label, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Text sx={{ width: 30 }}>{flagEmoji}</Text>
        <Text>{label}</Text>
      </Group>
    </div>
  )
)
SelectItem.displayName = 'SelectItem'

const CountrySelect = (props) => {
  const [data, setData] = useState([])

  useEffect(() => {
    const data = Object.keys(countries).reduce((prev, curr) => {
      return [...prev, {
        flagEmoji: countries[curr].emoji,
        value: curr,
        label: countries[curr].name
      }]
    }, [])
    data.sort((x, y) => {
      if (x.LastName < y.LastName) return -1
      if (x.LastName > y.LastName) return 1
      return 0
    })
    setData(data)
  }, [])

  const handleFilter = (value, item) => {
    return item.label.toLowerCase().includes(value.toLowerCase().trim())
  }
  console.log(props)
  return (
    <>
      <CountryCard img={philippinesFlag} countryName='Philippines' countryCode='PH' onChange={props.onChange} selected={props.value}>
        <ul style={{ fontWeight: '300' }}>
          <li>Primary account balance is <b>PHP</b>.</li>
          <li>Bank and cash transfer within Philippines (Photo ID Required).</li>
          <li>PHP account is globally connected via bitcoin/lightning networks.</li>
          <li>Stack sats in app (coming soon).</li>
        </ul>
      </CountryCard>
      <CountryCard img={elSalvadorFlag} countryName='El Salvador' countryCode='SV' onChange={props.onChange} selected={props.value}>
        <ul style={{ fontWeight: '300' }}>
          <li>Primary account balance is <b>USD</b>.</li>
          <li>Limited bank and cash transfer available in El Salvador (Photo ID Required).</li>
          <li>USD account is globally connected via bitcoin/lightning networks.</li>
          <li>Stack sats in app (coming soon).</li>
        </ul>
      </CountryCard>
      <CountryCard countryName='Somewhere Else' countryCode={true} selected={!['SV', 'PH'].includes(props.value)}>
        <div>
          <ul style={{ fontWeight: '300' }}>
            <li>Primary account balance is <b>BTC</b>.</li>
            <li>Bitcoin &amp; Lightning Connected.</li>
          </ul>
          <Select
            placeholder='Country'
            itemComponent={SelectItem}
            style={{ paddingLeft: '24px' }}
            data={data}
            searchable
            maxDropdownHeight={400}
            nothingFound='Not found'
            filter={handleFilter}
            {...props}
          />
        </div>
      </CountryCard>
    </>
  )
}

export default CountrySelect
