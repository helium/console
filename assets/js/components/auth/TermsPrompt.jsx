import React, { Component } from 'react';
import ReactDOM from "react-dom"

import TermsRaw from './TermsRaw.jsx';

const styles = {
  terms: {
    flex: 1,
    padding: 20,
  },
}

class TermsPrompt extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={styles.terms}>
        <TermsRaw />
      </div>
    )
  }
}

export default TermsPrompt
