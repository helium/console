import React from "react"
import Noty from 'noty';

import { store, persistor, history } from './store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

// Routes
import { Provider } from 'react-redux';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';
import { Route, Redirect } from 'react-router';
import PrivateRoute from './PrivateRoute.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import ResendVerification from './ResendVerification.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import ResetPassword from './ResetPassword.jsx';
import Home from './Home.jsx';
import Secret from './Secret.jsx';
import ConfirmEmailPrompt from './ConfirmEmailPrompt.jsx';

class ReactApp extends React.Component {
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
            <div>
              <Route exact path="/" component={Home}/>
              <Route path="/login" component={Login}/>
              <Route path="/resend_verification" component={ResendVerification}/>
              <Route path="/forgot_password" component={ForgotPassword}/>
              <Route path="/reset_password/:token" component={ResetPassword}/>
              <Route path="/register" component={Register}/>
              <Route path="/confirm_email" component={ConfirmEmailPrompt}/>
              <PrivateRoute path="/secret" component={Secret}/>
            </div>
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    )
  }
}

export default ReactApp
