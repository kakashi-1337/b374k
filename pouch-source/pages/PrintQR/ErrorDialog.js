import React from 'react'
import {
  useMantineTheme,
  Text,
  Box,
  Center,
  Dialog,
  Grid
} from '@mantine/core'
import { IconX } from '@tabler/icons'

const ErrorDialog = ({ invalidUsernames, ...rest }) => {
  const theme = useMantineTheme()
  return (
    <Dialog
      withCloseButton
      size="lg"
      radius="md"
      {...rest}
    >
      <Grid>
        <Grid.Col span={2}>
          <Center sx={{ borderRadius: theme.radius.max, backgroundColor: theme.other[theme.colorScheme].error, width: 40, height: 40 }}>
            <IconX size={18} color={theme.white} />
          </Center>
        </Grid.Col>
        <Grid.Col span={10}>
          <Box>
            <Text weight={600}>Username{invalidUsernames.length > 1 ? 's' : ''} not found</Text>
            <Text>{invalidUsernames.join(', ')}</Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Dialog>
  )
}

export default ErrorDialog