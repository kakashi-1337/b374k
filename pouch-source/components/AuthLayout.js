import React from 'react'
import { AppShell, Header, Container, Box, Center } from '@mantine/core'
import ColorSchemeToggle from './ColorSchemeToggle'
import BrandLogo from './BrandLogo'

const CustomHeader = () => {
  return (
    <Header fixed height={100} p="xl">
      <Center>
        <BrandLogo />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <ColorSchemeToggle />
        </Box>
      </Center>
    </Header>
  )
}

const AuthLayout = ({ children }) => {
  return (
    <AppShell fixed header={<CustomHeader height={70} padding="xs" />}>
      <Container size="xl" sx={{ marginTop: 100 }}>
        {children}
      </Container>
    </AppShell>
  )
}

export default AuthLayout
