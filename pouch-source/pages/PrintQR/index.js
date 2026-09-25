import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  useMantineTheme,
  useMantineColorScheme,
  Image,
  Container,
  Text,
  Group,
  Box,
  Switch,
  TextInput
} from '@mantine/core'
import pouchLogo from 'assets/images/logo.svg'
import pouchLogoWhite from 'assets/images/logo-white.svg'
import Single from './Single'
import Multiple4 from './Multiple4'
import Multiple8 from './Multiple8'
import Layouts from './Layouts'
import Backgrounds from './Backgrounds'

import qrBlankStandard from 'assets/images/qr-blank-standard.png'
// import qrBlankIsland from 'assets/images/qr-blank-island.png'
// import qrBlankBoat from 'assets/images/qr-blank-boat.png'
// import qrBlankHarbor from 'assets/images/qr-blank-harbor.png'
// import qrBlankSunset from 'assets/images/qr-blank-sunset.png'
// import qrBlankLake from 'assets/images/qr-blank-lake.png'

const HEADER_HEIGHT = 97

const customBgList = [
  // { name: 'island', src: qrBlankIsland, textColor: '#4A4A4A' }
]

const bgList = [
  { name: 'standard', src: qrBlankStandard, textColor: '#F9F9F9' },
  // { name: 'boat', src: qrBlankBoat, textColor: '#F9F9F9' },
  // { name: 'harbor', src: qrBlankHarbor, textColor: '#4A4A4A' },
  // { name: 'sunset', src: qrBlankSunset, textColor: '#F9F9F9' },
  // { name: 'lake', src: qrBlankLake, textColor: '#F9F9F9' }
]

const PrintQR = () => {
  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const spUsername = sp.get('username')
  const spUsernames = sp.get('usernames')
  const spLayout = sp.get('layout')
  const spBackgrounds = sp.get('backgrounds')
  const spBackground = sp.get('background')
  const spName = sp.get('name')

  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const [username, setUsername] = useState(spUsername || '')
  const [checked, setChecked] = useState(false)
  const [backgrounds, setBackgrounds] = useState(bgList)
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0])
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (spBackgrounds) {
      const queryBackgrounds = spBackgrounds.split(',')
      const backgrounds = [...bgList]

      queryBackgrounds.map((name) => {
        const bgData = customBgList.find((data) => name === data.name)
        if (bgData) {
          backgrounds.unshift(bgData)
        }
      })

      setSelectedBackground(backgrounds[0])
      setBackgrounds(backgrounds)
    } else if (spBackground) {
      const backgrounds = [...bgList, ...customBgList]
      const bgData = backgrounds.find((data) => spBackground === data.name)
      setSelectedBackground(bgData)
    }
    setShouldRender(true)
  }, [])

  // This is required to prevent rendering pdf viewer if background from url params is provided
  if (!shouldRender) return null

  if (spUsernames) {
    const queryUsernames = spUsernames.split(',')
    const layout = Number(spLayout) || queryUsernames.length
    if (layout === 1) {
      if (queryUsernames.length === 1) {
        return (
          <Single
            username={queryUsernames[0]}
            spName={spName}
            imageSrc={selectedBackground.src}
          />
        )
      }
    }
    if (layout === 4) {
      if (queryUsernames.length === 1) {
        const usernames = new Array(4).fill(queryUsernames[0])
        return <Multiple4 usernames={usernames} />
      } else if (queryUsernames.length === 4) {
        return (
          <Multiple4
            usernames={queryUsernames}
            imageSrc={selectedBackground.src}
            textColor={selectedBackground.textColor}
          />
        )
      }
    }
    if (layout === 8) {
      if (queryUsernames.length === 1) {
        const usernames = new Array(8).fill(queryUsernames[0])
        return <Multiple8 usernames={usernames} />
      } else if (queryUsernames.length === 8) {
        return (
          <Multiple8
            usernames={queryUsernames}
            imageSrc={selectedBackground.src}
            textColor={selectedBackground.textColor}
          />
        )
      }
    }
  }

  return (
    <>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: theme.other[theme.colorScheme].cardBgColor,
          top: 0,
          zIndex: 1,
          width: '100%',
          height: HEADER_HEIGHT,
          position: 'fixed',
          borderBottom: `1px solid ${theme.other[theme.colorScheme].outline}`
        }}
      >
        <Group
          p="xl"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <a href="https://pouch.ph">
            <Group position="center">
              <Image
                width={29}
                height={39}
                src={colorScheme === 'light' ? pouchLogo : pouchLogoWhite}
              />
              <Text
                weight={700}
                sx={{ fontSize: 26, color: theme.colors.brand[6] }}
              >
                Pouch.ph
              </Text>
            </Group>
          </a>
          <Text size="xl" weight={700}>
            Print QR Code
          </Text>
        </Group>
      </Box>
      <Container size="md" pt={HEADER_HEIGHT}>
        <Box m="xl">
          <Text size="xl" weight={700} mb="xl">
            Select Background
          </Text>
          <Backgrounds
            backgrounds={backgrounds}
            selectedBackground={selectedBackground}
            setSelectedBackground={setSelectedBackground}
          />
        </Box>
        <Box m="xl">
          <Text size="xl" weight={700} mb="xl">
            Select Layout
          </Text>
          <Group mb="xl" align="center">
            <TextInput
              size="lg"
              type="text"
              placeholder="Input username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={checked}
            />
            <Switch
              size="md"
              label="Input custom usernames"
              checked={checked}
              onChange={(e) => setChecked(e.currentTarget.checked)}
            />
          </Group>
          <Layouts username={username} showCustomInput={checked} />
        </Box>
      </Container>
    </>
  )
}

export default PrintQR
