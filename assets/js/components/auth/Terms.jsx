import React, { Component } from 'react';
import TermsPrompt from './TermsPrompt.jsx'
import DocumentLayout from '../common/DocumentLayout'
import analyticsLogger from '../../util/analyticsLogger'

class Terms extends Component {
  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_TERMS")
  }

  render() {
    return(
      <DocumentLayout>
        <TermsPrompt />
      </DocumentLayout>
    )
  }
}

export default Terms
