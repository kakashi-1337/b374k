import React, { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'

import Signin from './Signin'
import ForgotPassword from './ForgotPassword'
// import Signup from './Signup'
import Dashboard from './Dashboard'
import Account from './Dashboard/Account'
import ChangePassword from './Dashboard/Account/ChangePassword.js'
// import Send from './Dashboard/Send'
import Receive from './Dashboard/Receive'
import ManageContacts from './Dashboard/ManageContacts'
import AddPouchContact from './Dashboard/ManageContacts/AddPouchContact'
import AddBankRecipient from './Dashboard/ManageContacts/AddBankRecipient'
import Transactions from './Transactions'
import BatchPayment from './BatchPayment'
import ExchangeRates from './bridge/ExchangeRates'
import UserList from './bridge/UserList'
import { BridgeTransactions } from './bridge/BridgeTransactions'
import Mailroom from './bridge/Mailroom'

import materialUITheme from './materialUITheme' // To be replaced with Mantine UI
import AuthLayout from 'components/AuthLayout'
import PortalLayout from 'components/PortalLayout'
import { useUserContext } from 'hooks'
import Businesses from './bridge/Businesses'
import KYCDashboard from './bridge/KYCDashboard/KYCDashboard'

const Portal = () => {
  const history = useHistory()
  const location = useLocation()
  const { user, setUser, userLoading, refreshProfilePicture } = useUserContext()

  const newClientHost =
    process.env.REACT_APP_POUCH_WEB_URL || 'http://localhost:5173'

  useEffect(() => {
    if (location.pathname === '/signup') {
      window.location.href = `${newClientHost}/signup`
    } else if (!userLoading && !user) {
      window.location.href = `${newClientHost}/signin`
    } else if (user && (!user?.verified.email || !user?.verified.phone)) {
      window.location.href = `${newClientHost}/verification`
    }
  }, [userLoading, user])

  if (userLoading) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="loader" />
      </div>
    )
  }

  return (
    <ThemeProvider theme={materialUITheme}>
      <Router>
        <Switch>
          {user && (!user?.verified.email || !user?.verified.phone) && <></>}
          {user && (
            <PortalLayout>
              <Route
                path="/dashboard"
                render={({ match: { url } }) => (
                  <Switch>
                    <Route exact path={url}>
                      <Dashboard />
                    </Route>
                    <Route exact path={`${url}/account`}>
                      <Account />
                    </Route>
                    <Route exact path={`${url}/account/change-password`}>
                      <ChangePassword />
                    </Route>
                    {/* <Route exact path={`${url}/send`}>
                      <Send user={user} />
                    </Route> */}
                    <Route exact path={`${url}/receive`}>
                      <Receive user={user} />
                    </Route>
                    <Route exact path={`${url}/manage-contacts`}>
                      <ManageContacts user={user} />
                    </Route>
                    <Route
                      exact
                      path={`${url}/manage-contacts/add-pouch-contact`}
                    >
                      <AddPouchContact user={user} />
                    </Route>
                    <Route
                      exact
                      path={`${url}/manage-contacts/add-bank-recipient`}
                    >
                      <AddBankRecipient user={user} />
                    </Route>
                    <Redirect exact to={url} />
                  </Switch>
                )}
              />
              <Route exact path="/transactions">
                <Transactions />
              </Route>
              <Route exact path="/batch-payment">
                <BatchPayment user={user} />
              </Route>
              {['admin'].includes(user.role) && (
                <>
                  <Route
                    path="/bridge"
                    render={({ match: { url } }) => (
                      <Switch>
                        <Route exact path={`${url}/users`}>
                          <UserList />
                        </Route>
                        <Route exact path={`${url}/businesses`}>
                          <Businesses />
                        </Route>
                        <Route exact path={`${url}/transactions`}>
                          <BridgeTransactions user={user} />
                        </Route>
                        <Route exact path={`${url}/exchange-rates`}>
                          <ExchangeRates />
                        </Route>
                        <Route exact path={`${url}/mailroom`}>
                          <Mailroom user={user} />
                        </Route>
                        <Route exact path={`${url}/kyc-dashboard`}>
                          <KYCDashboard />
                        </Route>
                      </Switch>
                    )}
                  />
                </>
              )}
              <Route
                exact
                path={[
                  '/',
                  '/signin',
                  '/signup',
                  '/forgot-password',
                  '/verify',
                ]}
              >
                <Redirect to="/dashboard" />
              </Route>
            </PortalLayout>
          )}
        </Switch>
      </Router>
    </ThemeProvider>
  )
}

export default Portal
