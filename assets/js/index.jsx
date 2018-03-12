import React from 'react';
import {render} from 'react-dom';

import { store, persistor, history } from './store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

// Routes
import { Provider } from 'react-redux';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';
import { Route, Redirect } from 'react-router';
import PrivateRoute from './PrivateRoute.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Home from './Home.jsx';
import Secret from './Secret.jsx';
import ConfirmEmailPrompt from './ConfirmEmailPrompt.jsx';

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      { /* ConnectedRouter will use the store from Provider automatically */ }
      <ConnectedRouter history={history}>
        <div>
          <Route exact path="/" component={Home}/>
          <Route path="/login" component={Login}/>
          <Route path="/register" component={Register}/>
          <Route path="/confirm_email" component={ConfirmEmailPrompt}/>
          <PrivateRoute path="/secret" component={Secret}/>
        </div>
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('app')
)
