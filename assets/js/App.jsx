import React, { Component } from 'react';
import Router from './Router'
import { displayInfo, displayError } from './util/messages'
import AppCss from "../css/app.css"; // used!

class App extends Component {
  render() {
    if (window.flashInfo !== '') displayInfo(window.flashInfo)
    if (window.flashError !== '') displayError(window.flashError)

    return (
      <Router />
    )
  }
}

export default App
