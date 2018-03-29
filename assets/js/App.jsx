import React, { Component } from 'react';
import Noty from 'noty';
import Router from './Router'

class App extends Component {
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
      <Router />
    )
  }
}

export default App
