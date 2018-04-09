import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import DashboardLayout from '../DashboardLayout'
import AzureForm from './forms/AzureForm.jsx'
import AWSForm from './forms/AWSForm.jsx'
import GoogleForm from './forms/GoogleForm.jsx'
import MQTTForm from './forms/MQTTForm.jsx'
import HTTPForm from './forms/HTTPForm.jsx'
import ChannelNameForm from './forms/ChannelNameForm.jsx'
import { createChannel } from '../../actions/channel'

class ChannelNew extends Component {
  constructor(props) {
    super(props)

    this.handleStep2Input = this.handleStep2Input.bind(this)
    this.handleStep3Input = this.handleStep3Input.bind(this)
    this.handleStep3Submit = this.handleStep3Submit.bind(this)
    this.renderForm = this.renderForm.bind(this)
    this.state = {
      type: this.props.match.params.id,
      showStep3: false,
      credentials: {},
      channelName: ""
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id)
      this.setState({
        type: this.props.match.params.id,
        showStep3: false,
        credentials: {},
        channelName: ""
      })
  }

  handleStep2Input(credentials) {
    this.setState({ credentials, showStep3: true })
  }

  handleStep3Input(e) {
    this.setState({ channelName: e.target.value})
  }

  handleStep3Submit(e) {
    e.preventDefault()
    const { channelName, type, credentials } = this.state
    this.props.createChannel({
      name: channelName,
      type,
      credentials
    })
  }

  renderForm() {
    switch (this.state.type) {
      case "aws":
        return <AWSForm onValidInput={this.handleStep2Input}/>
      case "google":
        return <GoogleForm onValidInput={this.handleStep2Input}/>
      case "mqtt":
        return <MQTTForm onValidInput={this.handleStep2Input}/>
      case "http":
        return <HTTPForm onValidInput={this.handleStep2Input}/>
      default:
        return <AzureForm onValidInput={this.handleStep2Input}/>
    }
  }

  renderStep3() {
    if (this.state.showStep3)
      return <ChannelNameForm channelName={this.state.channelName} onInputUpdate={this.handleStep3Input} onSubmit={this.handleStep3Submit}/>
  }

  render() {
    return(
      <DashboardLayout title="Channel" current="channels">
        <h3>Step 1</h3>
        <p>Select a channel</p>
        <div><Link to={'/channels/new/azure'} replace>Azure IoT Hub</Link></div>
        <div><Link to={'/channels/new/aws'} replace>AWS IoT</Link></div>
        <div><Link to={'/channels/new/google'} replace>Google Cloud IoT Core</Link></div>
        <div><Link to={'/channels/new/mqtt'} replace>MQTT</Link></div>
        <div><Link to={'/channels/new/http'} replace>HTTP</Link></div>

        <h3>Step 2</h3>
        {this.renderForm()}
        {this.renderStep3()}
      </DashboardLayout>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ createChannel }, dispatch);
}

export default connect(null, mapDispatchToProps)(ChannelNew);
