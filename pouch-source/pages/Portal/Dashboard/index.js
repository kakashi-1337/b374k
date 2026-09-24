import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  useMantineTheme,
  useMantineColorScheme,
  Grid,
  Box,
  Text,
  Title,
  ActionIcon,
  Group,
  Image,
  Center
} from '@mantine/core'
import { QRCodeCanvas } from 'qrcode.react'
import Card from 'components/Card'
import Button from 'components/Button'
import netbankLogo from 'assets/images/netbank.svg'
import netbankLogoWhite from 'assets/images/netbank-white.svg'
import { EyeSlash, Eye, Send2, Receive, BookSaved } from 'iconsax-react'
import formatBalance from 'helpers/format-balance'
import { useUserContext } from 'hooks'

const Balance = () => {
  const { user } = useUserContext()
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const [hideBalance, setHideBalance] = useState(false)

  useEffect(() => {
    const hideBalance = localStorage.getItem('hideBalance')
    const value = JSON.parse(hideBalance)
    setHideBalance(value)
  }, [])

  const handleHideBalance = () => {
    const hideBalance = localStorage.getItem('hideBalance')
    const value = JSON.parse(hideBalance)
    localStorage.setItem('hideBalance', !value)
    setHideBalance(!value)
  }

  const availableBalance = formatBalance(
    user?.balances[user?.primaryCurrency],
    user?.primaryCurrency
  )
  const spacing = theme.spacing.lg

  return (
    <Card
      title={
        <Group position="apart" align="flex-start">
          <Box>
            <Text size="xl" weight={700}>
              {user?.name}
            </Text>
            <Text size="md">
              {user?.netbankAccountNumber.match(/.{1,4}/g).join(' ')}
            </Text>
          </Box>
          <Image
            mt={6}
            src={colorScheme === 'light' ? netbankLogo : netbankLogoWhite}
            width={63}
          />
        </Group>
      }
      sx={{
        backgroundColor: theme.other[theme.colorScheme].lightBgColor,
        position: 'relative',
        minHeight: 180
      }}
    >
      <Box sx={{ position: 'absolute', bottom: spacing }}>
        {hideBalance ? (
          <Title order={6}>********</Title>
        ) : (
          <Title
            order={6}
            sx={{ color: theme.other[theme.colorScheme].success }}
          >
            {availableBalance}
          </Title>
        )}
      </Box>
      <ActionIcon
        variant="transparent"
        onClick={handleHideBalance}
        sx={{ position: 'absolute', bottom: spacing, right: spacing }}
      >
        {hideBalance ? <Eye /> : <EyeSlash />}
      </ActionIcon>
    </Card>
  )
}

const Actions = () => {
  const history = useHistory()
  const theme = useMantineTheme()

  const iconColor = theme.other[theme.colorScheme].text

  const actionItems = [
    // {
    //   name: 'Send',
    //   icon: <Send2 color={iconColor} />,
    //   pathname: '/dashboard/send'
    // },
    {
      name: 'Receive',
      icon: <Receive color={iconColor} />,
      pathname: '/dashboard/receive'
    },
    {
      name: 'Manage Contacts',
      icon: <BookSaved color={iconColor} />,
      pathname: '/dashboard/manage-contacts'
    }
  ]

  return (
    <Card title="Actions">
      <Group grow align="flex-start">
        {actionItems.map((a) => (
          <Button
            key={a.name}
            variant="transparent"
            color={theme.other[theme.colorScheme].text}
            topIcon={a.icon}
            onClick={() => history.push(a.pathname)}
            sx={{ width: 80 }}
          >
            {a.name}
          </Button>
        ))}
      </Group>
    </Card>
  )
}

const QRCode = () => {
  const { user } = useUserContext()
  const theme = useMantineTheme()
  const qrValue = `https://pouch.ph/${user?.username}`

  const handleClick = () => {
    window.open(`/print-qr?username=${user?.username}`, '_blank')
  }

  return (
    <Card
      title={
        <Group position="apart">
          <Text size="xl" weight={700}>
            QR Code
          </Text>
          <Button compact variant="transparent" onClick={handleClick}>
            PRINT
          </Button>
        </Group>
      }
    >
      <Center mt="sm">
        <QRCodeCanvas
          value={qrValue}
          size={90}
          bgColor={theme.other[theme.colorScheme].backgroundColor}
          fgColor={theme.other[theme.colorScheme].text}
        />
      </Center>
    </Card>
  )
}

const Dashboard = () => {
  return (
    <Grid>
      <Grid.Col xs={12} sm={12} md={6} lg={5}>
        <Balance />
      </Grid.Col>
      <Grid.Col xs={12} sm={8} md={6} lg={5}>
        <Actions />
      </Grid.Col>
      <Grid.Col xs={12} sm={4} md={6} lg={2}>
        <QRCode />
      </Grid.Col>
    </Grid>
  )
}

export default Dashboard
