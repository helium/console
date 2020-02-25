import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
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
import LabelTag from '../common/LabelTag'
import { createChannel } from '../../actions/channel'
import analyticsLogger from '../../util/analyticsLogger'
import { ALL_LABELS } from '../../graphql/labels'
import { Typography, Select, Card } from 'antd';
const { Text } = Typography
const { Option } = Select

@connect(null, mapDispatchToProps)
class ChannelNew extends Component {
  state = {
    type: this.props.match.params.id,
    showNextSteps: false,
    credentials: {},
    channelName: "",
    labels: [],
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id)
      this.setState({
        type: this.props.match.params.id,
        showNextSteps: false,
        credentials: {},
        channelName: "",
        labels: [],
      })
  }

  handleStep2Input = (credentials) => {
    this.setState({ credentials, showNextSteps: true })
  }

  handleStep3Input = (e) => {
    this.setState({ channelName: e.target.value})
  }

  handleStep3Submit = (e) => {
    e.preventDefault()
    const { channelName, type, credentials, labels } = this.state
    analyticsLogger.logEvent("ACTION_CREATE_CHANNEL", { "name": channelName, "type": type })
    this.props.createChannel({
      name: channelName,
      type: type == 'cargo' ? 'http' : type,
      credentials,
    }, labels)
  }

  handleSelectLabels = (labels) => {
    this.setState({ labels })
  }

  renderForm = () => {
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

  render() {
    const { showNextSteps } = this.state
    const { data } = this.props

    return(
      <DashboardLayout title="Create New Integration">

      <Card title="Step 1 – Choose an Integration Type">

        <Card size="small" title="Use Helium Cargo">
          <ChannelCargoRow />
        </Card>

        <Card size="small" title="Use a Custom Integration">
          <ChannelCreateRow />
        </Card>

        </Card>
        <Card title="Step 2 - Enter Details">
          {this.renderForm()}
        </Card>
        { showNextSteps && (
            <ChannelNameForm
              channelName={this.state.channelName}
              onInputUpdate={this.handleStep3Input}
              onSubmit={this.handleStep3Submit}
            />
        )}
        { showNextSteps && data.allLabels && (
          <Card title="Step 4 - Apply Integration to Label (Optional)">
            <Select
              mode="multiple"
              onChange={this.handleSelectLabels}
              style={{ width: 220 }}
              placeholder="Choose Label..."
            >
              {data.allLabels.map(l => (
                <Option value={l.id} key={l.id}>
                  <LabelTag text={l.name} color={l.color} />
                </Option>
              ))}
            </Select>
          </Card>
        )}
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

export default graphql(ALL_LABELS, queryOptions)(ChannelNew)
