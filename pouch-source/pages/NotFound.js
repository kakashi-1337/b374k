import { useHistory } from 'react-router-dom'
import {
  createStyles,
  Button,
  Group,
  Container,
  Text,
  Center,
  Flex,
  useMantineTheme,
} from '@mantine/core'
import { BrandLogo } from 'components'

export const NotFound = () => {
  const theme = useMantineTheme()
  const { classes } = useStyles()
  const history = useHistory()

  const handleBackToHome = () => {
    history.push('/')
  }

  return (
    <Container className={classes.wrapper}>
      <Center my="lg">
        <Group>
          <BrandLogo />
          <Text
            size="xl"
            weight={700}
            style={{ color: theme.other[theme.colorScheme].primary }}
          >
            Pouch.ph
          </Text>
        </Group>
      </Center>
      <Flex
        mt={100}
        justify="center"
        align="center"
        direction="column"
        wrap="wrap"
      >
        <Text size="5rem">404</Text>
        <Text size="1.5rem">Page not found</Text>
        <Button mt="xl" onClick={handleBackToHome}>
          Back to Home
        </Button>
      </Flex>
    </Container>
  )
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    maxWidth: 556,
  },
  error: {
    color: theme.other.error,
    textAlign: 'center',
  },
}))
