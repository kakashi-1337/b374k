import { Select as MantineSelect, useMantineTheme } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons'

const Select = (props) => {
  const theme = useMantineTheme()
  return (
    <MantineSelect
      rightSection={<IconChevronDown color={theme.other[theme.colorScheme].text} />}
      {...props}
    />
  )
}

export default Select
