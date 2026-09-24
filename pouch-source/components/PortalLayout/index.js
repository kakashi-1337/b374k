import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMantineTheme, AppShell, Container, Alert } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import CustomHeader from './CustomHeader'
import CustomNavbar from './CustomNavbar'
import UserMenuDrawer from './UserMenuDrawer'
// https://iconsax-react.pages.dev/
import {
  Element4,
  Clock,
  Layer,
  Profile2User,
  Book1,
  ProgrammingArrows,
  Sms,
  Money,
  Setting2,
} from 'iconsax-react'
import { useUserContext } from 'hooks'

const NAVBAR_WIDTH = 280
const HEADER_HEIGHT = 97

const links = [
  {
    name: 'Wallet',
    icon: <Element4 />,
    pathname: 'wallet',
    customTo: `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/wallet`,
    nested: [
      {
        pathname: 'account',
        name: 'Account',
      },
      {
        pathname: 'send',
        name: 'Send',
      },
      {
        pathname: 'receive',
        name: 'Receive',
      },
      {
        pathname: 'manage-contacts',
        name: 'Manage Contacts',
      },
    ],
  },
  {
    name: 'Transactions',
    icon: <Clock />,
    pathname: 'transactions',
    customTo: `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/transactions`,
  },
  {
    name: 'Batch Payment',
    icon: <Layer />,
    pathname: 'batch-payment',
    customTo: `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/batch-payment`,
  },
]

const adminLinks = [
  {
    name: 'Manage Users',
    icon: <Profile2User />,
    pathname: '/bridge/users',
    customTo: `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/bridge/users`,
  },
  {
    name: 'Manage Businesses',
    icon: <Money />,
    pathname: '/bridge/businesses',
    to: '/bridge/businesses',
  },
  {
    name: 'All Transactions',
    icon: <Book1 />,
    pathname: '/bridge/transactions',
    customTo: `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/bridge/transactions`,
  },
  {
    name: 'Exchange Rates',
    icon: <ProgrammingArrows />,
    pathname: '/bridge/exchange-rates',
    to: '/bridge/exchange-rates',
  },
  {
    name: 'Mailroom',
    icon: <Sms />,
    pathname: '/bridge/mailroom',
    customTo: `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/bridge/mailroom`,
  },
  {
    name: 'Remote Config',
    icon: <Setting2 />,
    pathname: '/bridge/remote-config',
    customTo: `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/bridge/remote-config`,
  },
  {
    name: 'Automation',
    icon: <Setting2 />,
    pathname: '/bridge/automation',
    customTo: `${
      process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'
    }/bridge/automation`,
  },
  {
    name: 'KYC Dashboard (Old)',
    icon: <Setting2 />,
    pathname: '/bridge/kyc-dashboard',
    to: '/bridge/kyc-dashboard',
  },
]

const PortalLayout = ({ children }) => {
  const { user, setUser } = useUserContext()
  const [opened, setOpened] = useState(false)
  const [drawerOpened, setDrawerOpened] = useState(false)
  const theme = useMantineTheme()
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.sm}px)`)
  const navbarHidden = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`)
  const { pathname } = useLocation()
  const [breadcrumbs, setBreadcrumbs] = useState([])
  const [activePathname, setActivePathname] = useState('')

  useEffect(() => {
    // Transform breadcrumb names
    const pathnames = pathname.split('/').filter((p) => p)

    let breadcrumbs = []
    let allLinks = [...links]
    if (['admin'].includes(user.role)) {
      allLinks = [...allLinks, ...adminLinks]
    }

    let parentLinkIndex = 0
    if (pathnames[0] === 'bridge') {
      parentLinkIndex = allLinks.findIndex((obj) => {
        return obj.pathname === pathname
      })
    } else {
      parentLinkIndex = allLinks.findIndex((obj) => {
        return obj.pathname === pathnames[0]
      })
    }
    breadcrumbs.push(allLinks[parentLinkIndex]?.name)

    if (pathnames.length > 1 && pathnames[0] !== 'bridge') {
      pathnames.map((pathname) => {
        const link = allLinks[parentLinkIndex].nested.find(
          (l) => pathname === l.pathname,
        )
        if (link?.name) {
          breadcrumbs.push(link?.name)
        }
      })
    }

    setBreadcrumbs(breadcrumbs)
    setActivePathname(allLinks[parentLinkIndex]?.pathname)
  }, [pathname])

  const handleDrawer = () => setDrawerOpened(true)

  return (
    <>
      <AppShell
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        fixed
        navbar={
          <CustomNavbar
            activePathname={activePathname}
            setActivePathname={setActivePathname}
            links={links}
            adminLinks={adminLinks}
            opened={opened}
            setOpened={setOpened}
          />
        }
        sx={{
          main: {
            padding: 0,
            marginLeft: navbarHidden ? 0 : NAVBAR_WIDTH,
          },
        }}
      >
        <CustomHeader
          breadcrumbs={breadcrumbs}
          user={user}
          opened={opened}
          setOpened={setOpened}
          handleDrawer={handleDrawer}
        />
        <Container p={matches ? 'xl' : 'lg'} mt={HEADER_HEIGHT} fluid={true}>
          {/* <Alert
            title="Recommended - Download the Pouch Mobile App"
            color="orange"
            mb="lg"
          >
            Pouch for Web has been made available while it is still under
            development. Please download our native app on iOS, Android, or
            Huawei for the fully functional version of Pouch.
          </Alert> */}
          {children}
        </Container>
      </AppShell>
      <UserMenuDrawer
        user={user}
        setUser={setUser}
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
      />
    </>
  )
}

export default PortalLayout
