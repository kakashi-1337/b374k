import React from 'react'
import {
  useMantineTheme,
  Burger,
  MediaQuery,
  Text,
  Box,
  Group,
  Breadcrumbs
} from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { IconChevronRight } from '@tabler/icons'
import UserMenu from './UserMenu'
import UserMenuSmall from './UserMenuSmall'

const NAVBAR_WIDTH = 262
const HEADER_HEIGHT = 97
const HEADER_HEIGHT_SMALL = 75

const CustomHeaderContainer = ({ children, sx, ...rest }) => {
  const theme = useMantineTheme()
  const navbarHidden = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`)
  const { width } = useViewportSize()

  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: theme.other[theme.colorScheme].cardBgColor,
        top: 0,
        zIndex: 999,
        width: navbarHidden ? '100%' : width - NAVBAR_WIDTH,
        height: HEADER_HEIGHT,
        position: 'fixed',
        borderBottom: `1px solid ${theme.other[theme.colorScheme].outline}`,
        ...sx
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}

const CustomHeader = ({
  breadcrumbs,
  user,
  opened,
  setOpened,
  handleDrawer
}) => {
  const theme = useMantineTheme()

  const renderBreadcrumbs = () => {
    return breadcrumbs.map((name, i) => {
      return (
        <Text key={i} size="xl" weight={700}>
          {name}
        </Text>
      )
    })
  }

  return user ? (
    <>
      <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
        <CustomHeaderContainer>
          <Box
            p="xl"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Breadcrumbs
              separator={
                <IconChevronRight
                  strokeWidth={3}
                  size={20}
                  color={theme.other[theme.colorScheme].text}
                />
              }
            >
              {renderBreadcrumbs()}
            </Breadcrumbs>
            <Box spacing="lg">
              <UserMenu user={user} onClick={handleDrawer} />
            </Box>
          </Box>
        </CustomHeaderContainer>
      </MediaQuery>
      <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
        <CustomHeaderContainer sx={{ height: HEADER_HEIGHT_SMALL }}>
          <Box
            mx="md"
            mt={24}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Group>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.other[theme.colorScheme].text}
              />
              <Breadcrumbs
                separator={
                  <IconChevronRight
                    strokeWidth={3}
                    size={20}
                    color={theme.other[theme.colorScheme].text}
                  />
                }
              >
                {renderBreadcrumbs()}
              </Breadcrumbs>
            </Group>
            <UserMenuSmall user={user} onClick={handleDrawer} />
          </Box>
        </CustomHeaderContainer>
      </MediaQuery>
    </>
  ) : null
}

export default CustomHeader
