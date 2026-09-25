import React from 'react'
import { useHistory } from 'react-router-dom'
import {
  useMantineTheme,
  useMantineColorScheme,
  Image,
  Navbar,
  Text,
  Box,
  Group,
  Drawer,
  ScrollArea,
  Divider,
} from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { useUserContext } from 'hooks'
import Button from '../Button'
import pouchLogo from 'assets/images/logo.svg'
import pouchLogoWhite from 'assets/images/logo-white.svg'

const NAVBAR_WIDTH = 280

const NavbarButton = ({ active, to, customTo, icon, setOpened, children }) => {
  const theme = useMantineTheme()
  const history = useHistory()

  const handleClick = () => {
    if (customTo) {
      window.location.href = customTo
    } else {
      history.push(to)
    }
    setOpened(false)
  }

  return (
    <Button
      mb="sm"
      fullWidth
      onClick={handleClick}
      variant={active ? 'light' : 'subtle'}
      sx={{
        color: active
          ? theme.colors.brand[6]
          : theme.other[theme.colorScheme].secondary,
        height: 52,
        borderRadius: 15,
        padding: 0,
        div: {
          justifyContent: 'left',
          marginLeft: theme.spacing.md,
        },
        ':hover': {
          backgroundColor: theme.other[theme.colorScheme].lightBgColor,
        },
      }}
      leftIcon={icon}
    >
      {children}
    </Button>
  )
}

const NavbarButtonList = ({ links, adminLinks, activePathname, setOpened }) => {
  const { user } = useUserContext()
  return (
    <Box>
      {links.map((link) => {
        return (
          <NavbarButton
            key={link.name}
            active={link.pathname === activePathname}
            icon={link.icon}
            to={link.to}
            customTo={link.customTo}
            setOpened={setOpened}
          >
            {link.name}
          </NavbarButton>
        )
      })}
      {['admin'].includes(user.role) ? (
        <>
          {adminLinks.length ? <Divider mb="sm" /> : null}
          {adminLinks.map((link) => (
            <NavbarButton
              key={link.name}
              active={link.pathname === activePathname}
              icon={link.icon}
              to={link.to}
              customTo={link.customTo}
              setOpened={setOpened}
            >
              {link.name}
            </NavbarButton>
          ))}
        </>
      ) : null}
    </Box>
  )
}
const SiteLogo = () => {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  return (
    <a href="https://pouch.ph">
      <Group position="center">
        <Image
          width={29}
          height={39}
          src={colorScheme === 'light' ? pouchLogo : pouchLogoWhite}
        />
        <Text
          weight={700}
          sx={{
            fontSize: 26,
            color:
              colorScheme === 'light'
                ? theme.other.light.primary
                : theme.other.dark.text,
          }}
        >
          Pouch.ph
        </Text>
      </Group>
    </a>
  )
}

// Aka the sidebar
const CustomNavbar = ({
  activePathname,
  links,
  adminLinks,
  opened,
  setOpened,
}) => {
  const theme = useMantineTheme()
  const matches = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`)
  const { height } = useViewportSize()

  return (
    <>
      <Navbar
        hidden={matches}
        width={{ base: NAVBAR_WIDTH }}
        p="xl"
        sx={{
          alignItems: 'center',
          backgroundColor: theme.other[theme.colorScheme].cardBgColor,
        }}
      >
        <Navbar.Section grow component={ScrollArea} sx={{ width: '100%' }}>
          <Box mb="xl">
            <SiteLogo />
          </Box>
          <NavbarButtonList
            links={links}
            adminLinks={adminLinks}
            activePathname={activePathname}
            setOpened={setOpened}
          />
        </Navbar.Section>
      </Navbar>
      <Drawer
        padding="xl"
        opened={opened}
        onClose={() => setOpened((o) => !o)}
        title={<SiteLogo />}
      >
        <ScrollArea type="always" mt="xl" sx={{ height: height - 200 }}>
          <NavbarButtonList
            links={links}
            adminLinks={adminLinks}
            activePathname={activePathname}
            setOpened={setOpened}
          />
        </ScrollArea>
      </Drawer>
    </>
  )
}

export default CustomNavbar
