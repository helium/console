import React from "react"

import { store, persistor, history } from './store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

import { ApolloProvider } from 'react-apollo';
import apolloClient from './util/apolloClient'

// Routes
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './components/routes/PrivateRoute.jsx';
import PublicRoute from './components/routes/PublicRoute.jsx';
import UserOrgProvider from './components/UserOrgProvider'
import Login from './components/auth/Login.jsx';
import Terms from './components/auth/Terms.jsx';
import Register from './components/auth/Register.jsx';
import ResendVerification from './components/auth/ResendVerification.jsx';
import ForgotPassword from './components/auth/ForgotPassword.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';
import Profile from './components/Profile.jsx';
import TwoFactorPrompt from './components/auth/TwoFactorPrompt.jsx';
import ConfirmEmailPrompt from './components/auth/ConfirmEmailPrompt.jsx';
import DeviceIndex from './components/devices/DeviceIndex';
import DeviceShow from './components/devices/DeviceShow';
import ChannelIndex from './components/channels/ChannelIndex'
import ChannelShow from './components/channels/ChannelShow'
import ChannelNew from './components/channels/ChannelNew'
import UserIndex from './components/organizations/UserIndex'
import Dashboard from './components/dashboard/Dashboard'
import DataCredits from './components/billing/DataCredits'

class Router extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ApolloProvider client={apolloClient}>
            <UserOrgProvider>
              { /* ConnectedRouter will use the store from Provider automatically */ }
              <ConnectedRouter history={history}>
                <Switch>
                  <Redirect exact from="/" to="/login" />
                  <PublicRoute path="/login" component={Login}/>
                  <PublicRoute path="/terms" component={Terms}/>
                  <PublicRoute path="/resend_verification" component={ResendVerification}/>
                  <PublicRoute path="/forgot_password" component={ForgotPassword}/>
                  <PublicRoute path="/reset_password/:token" component={ResetPassword}/>
                  <PublicRoute path="/register" component={Register}/>
                  <PublicRoute path="/confirm_email" component={ConfirmEmailPrompt}/>
                  <PrivateRoute path="/2fa_prompt" component={TwoFactorPrompt}/>
                  <PrivateRoute path="/profile" component={Profile}/>
                  <PrivateRoute exact path="/devices" component={DeviceIndex} />
                  <PrivateRoute path="/devices/:id" component={DeviceShow}/>
                  <PrivateRoute exact path="/channels" component={ChannelIndex} />
                  <PrivateRoute exact path="/channels/new/:id?" component={ChannelNew} />
                  <PrivateRoute exact path="/channels/:id" component={ChannelShow} />
                  <PrivateRoute exact path="/users" component={UserIndex} />
                  <PrivateRoute exact path="/dashboard" component={Dashboard} />
                  <PrivateRoute exact path="/datacredits" component={DataCredits} />
                </Switch>
              </ConnectedRouter>
            </UserOrgProvider>
          </ApolloProvider>
        </PersistGate>
      </Provider>
    )
  }
}

export default Router
