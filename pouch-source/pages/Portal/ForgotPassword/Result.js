import React from 'react'
import { useHistory } from 'react-router-dom'
import {
  createStyles,
  useMantineTheme,
  Button,
  Container,
  Center,
  Box,
  Text
} from '@mantine/core'
import { IconCheck } from '@tabler/icons'

const Result = () => {
  const history = useHistory()
  const { classes } = useStyles()
  const theme = useMantineTheme()

  const handleExit = () => {
    history.replace('/signin')
  }

  const iconSize = 80

  return (
    <Container className={classes.wrapper}>
      <Center>
        <Box
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: theme.radius.max,
            backgroundColor: theme.other[theme.colorScheme].success
          }}
        >
          <IconCheck
            width={iconSize}
            height={iconSize}
            color={theme.other[theme.colorScheme].backgroundColor}
          />
        </Box>
      </Center>
      <Text my={80} weight={500} align="center">
        Password Changed Successfully
      </Text>
      <Button mt="md" size="lg" radius="md" fullWidth onClick={handleExit}>
        Sign In
      </Button>
    </Container>
  )
}

export default Result

const useStyles = createStyles(() => ({
  wrapper: {
    maxWidth: 300
  }
}))
