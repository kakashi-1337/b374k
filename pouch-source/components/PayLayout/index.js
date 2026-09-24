import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMantineTheme, AppShell, Container } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import CustomHeader from './CustomHeader'
import CustomNavbar from './CustomNavbar'
import UserMenuDrawer from './UserMenuDrawer'
// https://iconsax-react.pages.dev/
import { Element4, Clock, Shop, Link, Layer, Like1, Profile2User, Book1 } from 'iconsax-react';

const NAVBAR_WIDTH = 262
const HEADER_HEIGHT = 97

const links = [
  {
    name: "Dashboard",
    icon: <Element4 />,
    pathname: 'dashboard',
    to: "/pay/dashboard",
    nested: [
      {
        pathname: 'account',
        name: "Account",
      }
    ]
  },
  {
    name: "Activity",
    icon: <Clock />,
    pathname: 'activity',
    to: "/pay/activity",
  },
  {
    name: "Store Profile",
    icon: <Shop />,
    pathname: 'store-profile',
    to: "/pay/store-profile",
  },
  {
    name: "Links",
    icon: <Link />,
    pathname: 'links',
    to: "/pay/links",
  },
  {
    name: "Batch Payment",
    icon: <Layer />,
    pathname: 'batch-payment',
    to: "/pay/batch-payment",
  },
];

const adminLinks = [
  {
    name: "Approvals",
    icon: <Like1 />,
    pathname: 'approvals',
    to: "/pay/approvals",
  },
  {
    name: "Manage Users",
    icon: <Profile2User />,
    pathname: 'manage-users',
    to: "/pay/manage-users",
  },
  {
    name: "All Activity",
    icon: <Book1 />,
    pathname: 'all-activity',
    to: "/pay/all-activity",
  },
]

const PayLayout = ({ user, setUser, children }) => {
  const [opened, setOpened] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const theme = useMantineTheme();
  const matches = useMediaQuery(`(min-width: ${theme.breakpoints.sm}px)`);
  const navbarHidden = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const { pathname } = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [activePathname, setActivePathname] = useState('')

  useEffect(() => {
    // Transform breadcrumb names
    const pathnames = pathname.replace('/pay', '').split('/').filter(p => p)

    let breadcrumbs = []
    const allLinks = [...links, ...adminLinks]
    const parentLinkIndex = allLinks.findIndex((obj) => {
      return obj.pathname === pathnames[0]
    })
    breadcrumbs.push(allLinks[parentLinkIndex]?.name)

    if (pathnames.length > 1) {
      pathnames.map((pathname) => {
        const link = allLinks[parentLinkIndex].nested.find(l => pathname === l.pathname)
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
            marginLeft: navbarHidden ? 0 : NAVBAR_WIDTH
          }
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
  );
};

export default PayLayout;
