import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import DashboardLayout from '../common/DashboardLayout'
import AzureForm from './forms/AzureForm.jsx'
import AWSForm from './forms/AWSForm.jsx'
import GoogleForm from './forms/GoogleForm.jsx'
import MQTTForm from './forms/MQTTForm.jsx'
import HTTPForm from './forms/HTTPForm.jsx'
import CargoForm from './forms/CargoForm.jsx'
import ChannelNameForm from './forms/ChannelNameForm.jsx'
import ChannelCreateRow from './ChannelCreateRow'
import ChannelCargoRow from './ChannelCargoRow'
import { createChannel } from '../../actions/channel'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
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
    analyticsLogger.logEvent("ACTION_CREATE_CHANNEL", { "name": channelName, "type": type })
    this.props.createChannel({
      name: channelName,
      type: type == 'cargo' ? 'http' : type,
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
      case "azure":
        return <AzureForm onValidInput={this.handleStep2Input}/>
      default:
        return <CargoForm onValidInput={this.handleStep2Input}/>
    }
  }

  renderStep3() {
    if (this.state.showStep3)
      return <ChannelNameForm channelName={this.state.channelName} onInputUpdate={this.handleStep3Input} onSubmit={this.handleStep3Submit}/>
  }

  render() {
    return(
      <DashboardLayout title="Create New Channel">
        <Text strong>
          Step 1
        </Text>
        <br />
        <Text strong>
          Use Helium Cargo
        </Text>

        <ChannelCargoRow />

        <Text strong>
          Select a channel
        </Text>

        <ChannelCreateRow />

        {this.renderForm()}

        {this.renderStep3()}
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

export default ChannelNew
