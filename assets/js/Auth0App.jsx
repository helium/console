import React, { Component } from 'react';
import Auth0Router from './Auth0Router'
import { displayInfo, displayError } from './util/messages'
import AppCss from "../css/app.css"; // used!

class Auth0App extends Component {
  render() {
    if (window.flashInfo !== '') displayInfo(window.flashInfo)
    if (window.flashError !== '') displayError(window.flashError)

    return (
      <Auth0Router />
    )
  }
}

export default Auth0App
