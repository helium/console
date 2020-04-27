// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import { Auth0Provider } from './components/auth/Auth0Provider'
import { history } from './store/configureStore'
import { config } from './config/auth0'

const onRedirectCallback = appState => {
  // This uses replace instead of push because the Auth0 SDK
  // will overwrite the history with it's own special route otherwise
  history.replace(
    appState && appState.targetUrl
      ? appState.targetUrl + appState.params
      : window.location.pathname
  )
}

ReactDOM.render(
  <Auth0Provider
    domain={config.domain}
    client_id={config.clientId}
    audience={config.audience}
    redirect_uri={window.location.origin}
    onRedirectCallback={onRedirectCallback}
  >
    <App/>
  </Auth0Provider>,
  document.getElementById("react-root")
)
