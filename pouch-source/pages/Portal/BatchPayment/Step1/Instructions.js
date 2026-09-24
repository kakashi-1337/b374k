import { useState, useEffect } from 'react'
import { useMantineTheme, Box, Group, Text, Accordion } from '@mantine/core'

const Cell = ({ children, sx }) => {
  const theme = useMantineTheme()
  return (
    <Box
      p="xs"
      sx={{
        borderStyle: 'solid',
        borderColor: theme.other[theme.colorScheme].text,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderLeftWidth: 0,
        ...sx
      }}
    >
      <Text size="md">{children}</Text>
    </Box>
  )
}

const Instructions = () => {
  const [accordionItem, setAccordionItem] = useState(null)
  const [transitionDuration, setTransitionDuration] = useState(0)

  useEffect(() => {
    const instructionsOpened = localStorage.getItem('instructionsOpened')
    const accordionItem = JSON.parse(instructionsOpened) ? 'item-1' : ''
    setTransitionDuration(accordionItem === 'item-1' ? 0 : 200)
    setAccordionItem(accordionItem)
  }, [])

  const handleChange = () => {
    setTransitionDuration(200)
    const instructionsOpened = localStorage.getItem('instructionsOpened')
    const value = !JSON.parse(instructionsOpened)
    localStorage.setItem('instructionsOpened', value)
    const accordionItem = value ? 'item-1' : ''
    setAccordionItem(accordionItem)
  }

  return (
    <Box mb="md">
      <Accordion
        variant="filled"
        multiple={false}
        defaultValue={accordionItem}
        value={accordionItem}
        onChange={handleChange}
        transitionDuration={transitionDuration}
      >
        <Accordion.Item value="item-1">
          <Accordion.Control>Instructions</Accordion.Control>
          <Accordion.Panel>
            <Text>
              Copy rows from spreadsheet (Excel or Google Sheets) with the
              following format:
            </Text>
            <Group spacing={0} py="sm">
              <Cell sx={{ borderLeftWidth: 1 }}>username</Cell>
              <Cell>amount</Cell>
              <Cell>currency</Cell>
            </Group>
            <Text size="sm" italic weight={700}>
              e.g.
            </Text>
            <Group spacing={0} pb="md">
              <Cell sx={{ borderLeftWidth: 1 }}>juanandonly</Cell>
              <Cell>10,000.00</Cell>
              <Cell>PHP</Cell>
            </Group>
            <Group spacing={0}>
              <Text size="sm" weight={700}>
                Note:
              </Text>
              <Text size="sm">
                The currency value is optional. Leaving it blank will use your
                default currency.
              </Text>
            </Group>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  )
}

export default Instructions
