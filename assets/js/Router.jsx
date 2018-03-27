import React from "react"
import Noty from 'noty';

import { store, persistor, history } from './store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

// Routes
import { Provider } from 'react-redux';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './components/routes/PrivateRoute.jsx';
import PublicRoute from './components/routes/PublicRoute.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import ResendVerification from './components/auth/ResendVerification.jsx';
import ForgotPassword from './components/auth/ForgotPassword.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';
import Home from './components/Home.jsx';
import Secret from './components/Secret.jsx';
import Events from './components/Events';
import ConfirmEmailPrompt from './components/auth/ConfirmEmailPrompt.jsx';
import Devices from './components/Devices';
import Device from './components/Device';

class Router extends React.Component {
  displayFlash(type, text) {
    const config = {
      theme: 'relax',
      type,
      text,
      timeout: 5000
    }
    new Noty(config).show()
  }

  render() {
    if (window.flashInfo !== '') this.displayFlash('success', window.flashInfo)
    if (window.flashError !== '') this.displayFlash('error', window.flashError)

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
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
              <PrivateRoute path="/events" component={Events}/>
              <PrivateRoute exact path="/devices" component={Devices} />
              <PrivateRoute path="/devices/:id" component={Device}/>
            </Switch>
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    )
  }
}

export default Router
