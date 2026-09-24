import React from 'react'
import { useMantineTheme, Text, Box, Group } from '@mantine/core'

const ListItem = ({
  icon,
  name,
  color,
  rightComponent,
  disabled,
  sx,
  ...rest
}) => {
  const theme = useMantineTheme()
  return (
    <Box
      p="sm"
      sx={{
        opacity: disabled ? 0.3 : 1,
        borderRadius: theme.radius.sm,
        ':hover': {
          cursor: disabled ? 'default' : 'pointer',
          backgroundColor: disabled
            ? 'transparent'
            : theme.other[theme.colorScheme].lightBgColor
        },
        ':active': {
          opacity: 0.6
        },
        ...sx
      }}
      {...rest}
    >
      <Group position="apart">
        <Group>
          {icon}
          <Text weight={600} size="lg" sx={{ color, userSelect: 'none' }}>
            {name}
          </Text>
        </Group>
        {rightComponent}
      </Group>
    </Box>
  )
}

export default ListItem
