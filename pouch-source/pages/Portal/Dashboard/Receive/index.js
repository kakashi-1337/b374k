import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import dayjs from 'dayjs'
import {
  createStyles,
  useMantineTheme,
  Container,
  Grid,
  Paper,
  Box,
  Group,
  Text,
  Button,
  Loader,
  TextInput,
  Progress,
  Center
} from '@mantine/core'
import { useMediaQuery, useClipboard, useViewportSize } from '@mantine/hooks'
import { QRCodeCanvas } from 'qrcode.react'
import { IconBolt, IconCurrencyBitcoin, IconCircleCheck } from '@tabler/icons'
import Confetti from 'react-confetti'
import Card from 'components/Card'
import BackButton from 'components/BackButton'
import bolt11 from 'helpers/bolt11'
import updateCurrencyInput from 'helpers/update-currency-input'
import formatBalance from 'helpers/format-balance'
import bitcoinLogo from 'assets/images/bitcoin-logo.png'
import pouchConstants from 'pouchConstants'

const Receive = ({ user }) => {
  const { classes } = useStyles()
  const { width, height } = useViewportSize()
  const history = useHistory()
  const theme = useMantineTheme()
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`)
  const [connected, setConnected] = useState(false)
  const [checkingInvoice, setCheckingInvoice] = useState(false)
  const [paid, setPaid] = useState(false)
  const [txData, setTxData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [showMemoField, setShowMemoField] = useState(false)
  const [memoField, setMemoField] = useState('')
  const [expiry, setExpiry] = useState(0)
  const [expiresInSeconds, setExpiresInSeconds] = useState(expiry)
  const [timeExpireDate, setTimeExpireDate] = useState(0)
  const clipboard = useClipboard({ timeout: 1000 })

  useEffect(() => {
    if (timeExpireDate) {
      updateExpiration()
    }
  }, [timeExpireDate])

  const updateExpiration = () => setTimeout(() => {
    const expires = timeExpireDate - dayjs().unix() - 1
    setExpiresInSeconds(expires)
    if (expires > 0) {
      updateExpiration()
    }
  }, 1000)

  const handleSubmitClick = () => {
    setLoading(true)
    const data = {
      amount: Number(amount),
      username: user.username,
      memo: memoField
    }
    axios.post('/api/v0/transaction/create-bolt11', data)
      .then((res) => {
        setLoading(false)
        setTxData(res.data)
        const { timestamp, timeExpireDate } = bolt11.parse(res.data.bolt11)
        const expiry = timeExpireDate - timestamp - 1
        setExpiry(expiry)
        setExpiresInSeconds(expiry)
        setTimeExpireDate(timeExpireDate)
        connectToSocket(res.data)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
        setTxData(null)
      })
  }

  const connectToSocket = (tx) => {
    const socket = io('/', { autoConnect: false })
    socket.connect()
    socket.emit('subscribe_to_tx_id', tx._id)
    socket.on('connect', () => { setConnected(true) })
    socket.on('connect_error', () => { setConnected(false) })
    socket.on('disconnect', () => { setConnected(false) })
    socket.on('data', (data) => {
      data.status === 'completed' && setPaid(true)
      data.metadata?.redirectUrl && window.location.replace(data.metadata?.redirectUrl)
    })
  }

  const handleCheckInvoice = () => {
    setCheckingInvoice(true)
    axios.get('/api/v0/transaction/check-bolt11', { params: { bolt11: txData.bolt11 } })
      .then((res) => {
        setTxData(res.data)
        if (res.data.status === 'completed') setPaid(true)
        setCheckingInvoice(false)
      })
      .catch((err) => {
        setCheckingInvoice(false)
        alert('Error: ', err)
      })
  }

  const makeSharableUrl = () => {
    const { username, primaryCurrency } = user
    let sharableUrl = `${process.env.POUCH_WEB_URL}/${username}?amount=${Number(amount)}&currency=${primaryCurrency}`
    if (memoField.length) sharableUrl += `&memo=${memoField}`
    return sharableUrl
  }

  const handleReset = () => {
    setTxData(null)
    setPaid(false)
    setAmount('')
    setMemoField('')
    setShowMemoField(false)
  }

  const handleBack = () => history.replace('/dashboard')

  if (loading) {
    return (
      <Container size='xs' sx={{ padding: 0 }}>
        <Card mt='xs' title='Receive'>
          <Paper withBorder>
            <Center m='xl'>
              <Loader size='xl' />
            </Center>
          </Paper>
        </Card>
      </Container>
    )
  }
  if (txData) {
    return (
      <Container size='xs' sx={{ padding: 0 }}>
        <Card mt='xs' title='Receive'>
          <Paper withBorder sx={{ overflow: 'hidden' }}>
            {paid && <Confetti
              width={width}
              height={height}
              recycle={false}
              colors={[pouchConstants.COLORS.ULTRAVIOLET, pouchConstants.COLORS.BITTERSWEET, pouchConstants.COLORS.AZURE, pouchConstants.COLORS.EMERALD, pouchConstants.COLORS.LIGHTNING_YELLOW, pouchConstants.COLORS.BITCOIN_ORANGE]}
            />}
            {expiresInSeconds > 0 && !paid
              ? <Box>
                <Progress size='xs' value={expiresInSeconds / expiry * 100} style={{ width: '100%' }} color='brand' />
                <Group className={classes.refresh} m='md' spacing='xs' onClick={checkingInvoice ? undefined : () => handleCheckInvoice()}>
                  <Text>{checkingInvoice ? 'Refreshing' : 'Refresh'}</Text>
                  <Box className={[classes.refreshCircle, connected ? classes.successColor : classes.failedColor]}></Box>
                </Group>
              </Box>
              : null}
            <Group m='xl' direction='column' position='center'>
              <Text size='xl'>{formatBalance(txData.recipient.total, txData.recipient.currency)}</Text>
              <Text>{memoField}</Text>
              {paid
                ? <Group direction='column' position='center'>
                  <IconCircleCheck className={classes.successIcon} />
                  <Button size='md' onClick={handleReset}>Create a New Invoice</Button>
                  <Button size='md' onClick={handleBack}>Back to Home</Button>
                </Group>
                : expiresInSeconds <= 0
                  ? <Group direction='column' position='center'>
                    <Text my='lg' size='lg' align='center'>Oops! This Lightning Invoice Has Expired.</Text>
                    <Button size='md' onClick={handleSubmitClick}>Get a New One</Button>
                    <Button size='md' onClick={handleBack}>Back to Home</Button>
                  </Group>
                  : <Group direction='column' position='center'>
                    <QRCodeCanvas
                      value={txData.bolt11}
                      size={200}
                      imageSettings={{ src: '/images/lightning-network-logo.png', width: 40, height: 40 }}
                      bgColor='transparent'
                      fgColor={theme.other[theme.colorScheme].text}
                    />
                    <Button size='md' disabled={clipboard.copied} onClick={() => clipboard.copy(txData.bolt11)}>{clipboard.copied ? 'Copied' : 'Copy'}</Button>
                  </Group>
              }
            </Group>
          </Paper>
        </Card>
      </Container>
    )
  }
  return (
    <>
      <BackButton onClick={handleBack} />
      <Card mt='xs' title='Receive'>
        <Paper withBorder sx={{ overflow: 'hidden' }}>
          <Grid m={0}>
            <Grid.Col
              md={6}
              className={matches ? classes.dividerRight : classes.dividerBottom}
              sx={{ padding: 0 }}
            >
              <Box m='lg'>
                <Group position='center' direction='column'>
                  <Group spacing='xs' mb='xl'>
                    <IconBolt className={classes.header} />
                    <Text className={classes.header} weight={500}>Lightning</Text>
                  </Group>
                  <Box sx={{ maxWidth: 320 }}>
                    <TextInput
                      className={classes.input}
                      size='xl'
                      value={amount}
                      onChange={(e) => updateCurrencyInput(e.target.value, setAmount)}
                      rightSection={<Text>{user.primaryCurrency}</Text>}
                      sx={{ input: { textAlign: 'center' } }}
                    />
                    {showMemoField
                      ? <TextInput
                        className={classes.input}
                        mt='lg'
                        placeholder='Leave a note...'
                        value={memoField}
                        onChange={(e) => setMemoField(e.target.value)}
                      />
                      : <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button mt='xs' size='xs' compact variant='subtle' onClick={() => setShowMemoField(true)}>+ Add Note</Button>
                      </Box>}
                  </Box>
                  <Button size='md' mt='lg' onClick={handleSubmitClick} disabled={!(Number(amount) > 0)}>Show QR Code</Button>
                  <Button
                    size='md'
                    onClick={() => clipboard.copy(makeSharableUrl())}
                    disabled={!(Number(amount) > 0)}
                  >
                    Copy Invoice URL
                  </Button>
                </Group>
              </Box>
            </Grid.Col>
            <Grid.Col md={6} sx={{ padding: 0 }}>
              <Box m='lg'>
                <Group position='center' direction='column'>
                  <Group spacing='xs' mb='xl'>
                    <IconCurrencyBitcoin className={classes.header} />
                    <Text className={classes.header} weight={500}>On-Chain</Text>
                  </Group>
                  <QRCodeCanvas
                    value={user.onChainReceivingWallet.address}
                    size={200}
                    imageSettings={{ src: bitcoinLogo, width: 40, height: 40 }}
                    bgColor='transparent'
                    fgColor={theme.other[theme.colorScheme].text}
                  />
                  <Text>{user.onChainReceivingWallet.address}</Text>
                  <Button
                    size='md'
                    disabled={clipboard.copied}
                    onClick={() => clipboard.copy(user.onChainReceivingWallet.address)}
                  >
                    {clipboard.copied ? 'Copied' : 'Copy'}
                  </Button>
                </Group>
              </Box>
            </Grid.Col>
          </Grid>
        </Paper>
      </Card>
    </>
  )
}

export default Receive

const useStyles = createStyles((theme) => ({
  dividerRight: {
    borderRight: `1px solid ${theme.other[theme.colorScheme].borderColor}`
  },
  dividerBottom: {
    borderBottom: `1px solid ${theme.other[theme.colorScheme].borderColor}`
  },
  header: {
    color: theme.colorScheme === 'light' ? theme.colors.brand[6] : theme.colors.brand[2]
  },
  input: {
    width: '100%'
  },
  refresh: {
    cursor: 'pointer',
    justifyContent: 'flex-end',
    ':hover': {
      opacity: 0.5
    }
  },
  refreshCircle: {
    width: 8,
    height: 8,
    borderRadius: '50%'
  },
  successIcon: {
    width: 70,
    height: 70,
    color: theme.other.success
  },
  successColor: {
    backgroundColor: theme.other.success
  },
  failedColor: {
    backgroundColor: theme.other.error
  }
}))
