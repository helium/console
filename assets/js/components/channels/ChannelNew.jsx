import React, { Component } from 'react'
import DashboardLayout from '../DashboardLayout'
import AzureForm from './forms/AzureForm.jsx'
import AWSForm from './forms/AWSForm.jsx'
import GoogleForm from './forms/GoogleForm.jsx'
import MQTTForm from './forms/MQTTForm.jsx'
import HTTPForm from './forms/HTTPForm.jsx'

class ChannelNew extends Component {
  constructor(props) {
    super(props)
    const searchParams = new URLSearchParams(this.props.location.search)

    this.handleClick = this.handleClick.bind(this)
    this.renderForm = this.renderForm.bind(this)
    this.state = {
      kind: searchParams.get('kind')
    }
  }

  handleClick(kind) {
    if (this.state.kind !== kind) {
      this.setState({kind})
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
        <div onClick={() => this.handleClick("azure")}>Azure IoT Hub</div>
        <div onClick={() => this.handleClick("aws")}>AWS IoT</div>
        <div onClick={() => this.handleClick("google")}>Google Cloud IoT Core</div>
        <div onClick={() => this.handleClick("mqtt")}>MQTT</div>
        <div onClick={() => this.handleClick("http")}>HTTP</div>

        <h3>Step 2</h3>
        {this.renderForm()}
      </DashboardLayout>
    )
  }
}

export default ChannelNew;
