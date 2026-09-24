import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { MantineProvider, ColorSchemeProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { UserProvider } from './context'

import './styles/_main.sass'
import ScrollToTop from './components/ScrollToTop'
import Portal from './pages/Portal'
import PrintQR from './pages/PrintQR'

import Home from './pages/Site/Home'
import TermsOfService from './pages/Site/TermsOfService'
import PrivacyPolicy from './pages/Site/PrivacyPolicy'
import ProductDisclosureStatement from './pages/Site/ProductDisclosureStatement'
import Limits from './pages/Site/Limits'
import AmbassadorProgram from './pages/Site/AmbassadorProgram'
import Support from './pages/Site/Support'
import { NotFound } from 'pages/NotFound'

import theme from './theme'
import styles from './theme/styles'

const App = () => {
  const [colorScheme, setColorScheme] = useState('light')

  const toggleColorScheme = (value) => {
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider theme={{ ...theme, colorScheme, components: styles }}>
        <NotificationsProvider>
          <UserProvider>
            <Router>
              <ScrollToTop />
              <div style={{ minHeight: '100vh' }}>
                <Switch>
                  <Route exact path="/"><Home /></Route>
                  <Route exact path="/terms-of-service"><TermsOfService /></Route>
                  <Route exact path="/privacy-policy"><PrivacyPolicy /></Route>
                  <Route exact path="/product-disclosure-statement"><ProductDisclosureStatement /></Route>
                  <Route exact path="/limits"><Limits /></Route>
                  <Route exact path="/ambassador-program"><AmbassadorProgram /></Route>
                  <Route exact path="/support"><Support /></Route>
                  <Route
                    path={[
                      '/dashboard',
                      '/bridge',
                      '/manage-agents',
                      '/advanced'
                    ]}
                  >
                    <Portal />
                  </Route>
                  <Route path="/print-qr">
                    <PrintQR />
                  </Route>
                  <Route path='*' exact={true} component={NotFound} />
                </Switch>
              </div>
            </Router>
          </UserProvider>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}
export default App
