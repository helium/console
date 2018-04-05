import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DashboardLayout from '../DashboardLayout'
import AzureForm from './forms/AzureForm'
import AWSForm from './forms/AWSForm'
import GoogleForm from './forms/GoogleForm'
import MQTTForm from './forms/MQTTForm'
import HTTPForm from './forms/HTTPForm'
import Button from '../common/Button'

class ChannelShow extends Component {
  constructor(props) {
    super(props)
    const searchParams = new URLSearchParams(this.props.location.search)

    this.handleClick = this.handleClick.bind(this)
    this.renderForm = this.renderForm.bind(this)
    this.state = {
      kind: searchParams.get('kind')
    }
  }

  handleClick(e) {
    if (this.state.kind !== e.target.id) {
      this.setState({kind: e.target.id})
    }
  }

  renderForm() {
    switch (this.state.kind) {
      case "aws":
        return <AWSForm />
      case "google":
        return <GoogleForm />
      case "mqtt":
        return <MQTTForm />
      case "http":
        return <HTTPForm />
      default:
        return <AzureForm />
    }
  }

  render() {
    return(
      <DashboardLayout title="Channel" current="channels">
        <h3>Step 1</h3>
        <p>Select a channel</p>
        <div id="azure" onClick={this.handleClick}>Azure IoT Hub</div>
        <div id="aws" onClick={this.handleClick}>AWS IoT</div>
        <div id="google" onClick={this.handleClick}>Google Cloud IoT Core</div>
        <div id="mqtt" onClick={this.handleClick}>MQTT</div>
        <div id="http" onClick={this.handleClick}>HTTP</div>

        <h3>Step 2</h3>
        {this.renderForm()}
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(null, mapDispatchToProps)(ChannelShow);
