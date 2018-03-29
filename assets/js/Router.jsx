import React from "react"

import { store, persistor, history } from './store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

// Routes
import { Provider } from 'react-redux';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './components/routes/PrivateRoute.jsx';
import PublicRoute from './components/routes/PublicRoute.jsx';
import SocketHandler from './components/SocketHandler'
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import ResendVerification from './components/auth/ResendVerification.jsx';
import ForgotPassword from './components/auth/ForgotPassword.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';
import Home from './components/Home.jsx';
import Secret from './components/Secret.jsx';
import ConfirmEmailPrompt from './components/auth/ConfirmEmailPrompt.jsx';
import DeviceIndex from './components/devices/DeviceIndex';
import DeviceShow from './components/devices/DeviceShow';
import GatewayIndex from './components/gateways/GatewayIndex'
import GatewayShow from './components/gateways/GatewayShow'

class Router extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SocketHandler>
            { /* ConnectedRouter will use the store from Provider automatically */ }
            <ConnectedRouter history={history}>
              <Switch>
                  <Route exact path="/" component={Home}/>
                  <PublicRoute path="/login" component={Login}/>
                  <PublicRoute path="/resend_verification" component={ResendVerification}/>
                  <PublicRoute path="/forgot_password" component={ForgotPassword}/>
                  <PublicRoute path="/reset_password/:token" component={ResetPassword}/>
                  <PublicRoute path="/register" component={Register}/>
                  <PublicRoute path="/confirm_email" component={ConfirmEmailPrompt}/>
                  <PrivateRoute path="/secret" component={Secret}/>
                  <PrivateRoute exact path="/devices" component={DeviceIndex} />
                  <PrivateRoute path="/devices/:id" component={DeviceShow}/>
                  <PrivateRoute exact path="/gateways" component={GatewayIndex} />
                  <PrivateRoute exact path="/gateways/:id" component={GatewayShow} />
              </Switch>
            </ConnectedRouter>
          </SocketHandler>
        </PersistGate>
      </Provider>
    )
  }
}

export default Router
