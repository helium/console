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
import Profile from './components/profile/Profile.jsx';
import TwoFactorPrompt from './components/auth/TwoFactorPrompt.jsx';
import ConfirmEmailPrompt from './components/auth/ConfirmEmailPrompt.jsx';
import DeviceIndex from './components/devices/DeviceIndex';
import DeviceShow from './components/devices/DeviceShow';
import ChannelIndex from './components/channels/ChannelIndex'
import ChannelShow from './components/channels/ChannelShow'
import ChannelNew from './components/channels/ChannelNew'
import UserIndex from './components/organizations/UserIndex'
import OrganizationIndex from './components/organizations/OrganizationIndex'
import LabelIndex from './components/labels/LabelIndex'
import LabelShow from './components/labels/LabelShow'
import DataCredits from './components/billing/DataCredits'
import FunctionIndex from './components/functions/FunctionIndex';
import FunctionNew from './components/functions/FunctionNew';
import FunctionShow from './components/functions/FunctionShow';

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
                  <PrivateRoute exact path="/labels" component={LabelIndex} />
                  <PrivateRoute path="/devices/:id" component={DeviceShow}/>
                  <PrivateRoute path="/labels/:id" component={LabelShow} />
                  <PrivateRoute exact path="/integrations" component={ChannelIndex} />
                  <PrivateRoute exact path="/integrations/new/:id?" component={ChannelNew} />
                  <PrivateRoute exact path="/integrations/:id" component={ChannelShow} />
                  <PrivateRoute exact path="/users" component={UserIndex} />
                  <PrivateRoute exact path="/organizations" component={OrganizationIndex} />
                  <PrivateRoute exact path="/datacredits" component={DataCredits} />
                  <PrivateRoute exact path="/functions" component={FunctionIndex} />
                  <PrivateRoute exact path="/functions/new" component={FunctionNew} />
                  <PrivateRoute exact path="/functions/:id" component={FunctionShow} />
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
