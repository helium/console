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
import ChannelNameForm from './forms/ChannelNameForm.jsx'
import ChannelCreateRow from './ChannelCreateRow'
import { createChannel } from '../../actions/channel'

//MUI
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

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
        <Card>
          <CardContent>
            <Typography variant="headline">
              Step 1
            </Typography>

            <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
              Select a channel
            </Typography>

            <ChannelCreateRow />
          </CardContent>
        </Card>

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
