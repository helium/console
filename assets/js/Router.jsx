import React from "react"

import { store, persistor, history } from './store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

import { ApolloProvider } from 'react-apollo';
import { setupApolloClient } from './util/apolloClient'

// Routes
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import ConsoleRoute from './components/routes/ConsoleRoute.jsx';
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
import Dashboard from './components/dashboard/Dashboard'
import LabelIndex from './components/labels/LabelIndex'
import LabelShow from './components/labels/LabelShow'
import DataCredits from './components/billing/DataCredits'
import { useAuth0  } from './components/auth/Auth0Provider'
import { useEffect } from "react";

const Router = () => {
  const { loading, isAuthenticated, loginWithRedirect, getTokenSilently } = useAuth0();
  useEffect(() => {
    if (loading || isAuthenticated) {
      return;
    }
    const fn = async () => {
      await loginWithRedirect({
        appState: {targetUrl: window.location.pathname}
      });
    };
    fn();
  }, [loading, isAuthenticated, loginWithRedirect]);
  if (loading) {
    return <div>Loading...</div>
  }
  const apolloClient = setupApolloClient(getTokenSilently);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <UserOrgProvider>
          <ApolloProvider client={apolloClient}>
            { /* ConnectedRouter will use the store from Provider automatically */ }
            <ConnectedRouter history={history}>
              <Switch>
                {/* <Redirect exact from="/" to="/dashboard" /> */}
                <PublicRoute path="/terms" component={Terms}/>
                <ConsoleRoute path="/profile" component={Profile}/>
                <ConsoleRoute exact path="/devices" component={DeviceIndex} />
                <ConsoleRoute exact path="/labels" component={LabelIndex} />
                <ConsoleRoute path="/devices/:id" component={DeviceShow}/>
                <ConsoleRoute path="/labels/:id" component={LabelShow} />
                <ConsoleRoute exact path="/integrations" component={ChannelIndex} />
                <ConsoleRoute exact path="/integrations/new/:id?" component={ChannelNew} />
                <ConsoleRoute exact path="/integrations/:id" component={ChannelShow} />
                <ConsoleRoute exact path="/users" component={UserIndex} />
                <ConsoleRoute exact path="/dashboard" component={Dashboard} />
                <ConsoleRoute exact path="/datacredits" component={DataCredits} />
              </Switch>
            </ConnectedRouter>
          </ApolloProvider>
        </UserOrgProvider>
      </PersistGate>
    </Provider>
  )
}

export default Router;
