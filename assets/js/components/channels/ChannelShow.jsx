import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import pick from 'lodash/pick'
import DashboardLayout from '../common/DashboardLayout'
import HttpDetails from './HttpDetails'
import AzureForm from './forms/AzureForm.jsx'
import AWSForm from './forms/AWSForm.jsx'
import GoogleForm from './forms/GoogleForm.jsx'
import MQTTForm from './forms/MQTTForm.jsx'
import HTTPForm from './forms/HTTPForm.jsx'
import { updateChannel } from '../../actions/channel'
import { CHANNEL_FRAGMENT, CHANNEL_UPDATE_SUBSCRIPTION } from '../../graphql/channels'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Typography, Button, Input, Form, Tag, Checkbox } from 'antd';
const { Text } = Typography

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

const query = gql`
  query ChannelShowQuery ($id: ID!) {
    channel(id: $id) {
      ...ChannelFragment
      method
      endpoint
      inbound_token
      headers
      devices {
        name
      }
    }
  }
  ${CHANNEL_FRAGMENT}
`

@graphql(query, queryOptions)
@connect(null, mapDispatchToProps)
class ChannelShow extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newName: "",
      credentials: {}
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleShowDupesUpdate = this.handleShowDupesUpdate.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleUpdateDetailsInput = this.handleUpdateDetailsInput.bind(this);
    this.handleUpdateDetailsChange = this.handleUpdateDetailsChange.bind(this);
  }

  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data
    const channelId = this.props.match.params.id
    analyticsLogger.logEvent("ACTION_NAV_CHANNEL_SHOW", {"id": channelId})

    subscribeToMore({
      document: CHANNEL_UPDATE_SUBSCRIPTION,
      variables: { channelId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleUpdateDetailsInput(credentials) {
    this.setState({ credentials })
  }

  handleNameChange() {
    const { channel } = this.props.data
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_NAME", { "id": channel.id, "name": this.state.newName})
    this.props.updateChannel(channel.id, { name: this.state.newName })
    this.setState({ newName: ""})
  }

  handleShowDupesUpdate() {
    const { channel } = this.props.data
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DUPLICATES_FLAG", { "id": channel.id, "show_dupes": !channel.show_dupes })
    this.props.updateChannel(channel.id, { show_dupes: !channel.show_dupes })
  }

  handleUpdateDetailsChange() {
    const { channel } = this.props.data
    const { credentials } = this.state
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DETAILS", { "id": channel.id})
    this.props.updateChannel(channel.id, { credentials })
    this.setState({ credentials: {} })
  }

  renderForm() {
    const { channel } = this.props.data

    switch (channel.type) {
      case "aws":
        return <AWSForm onValidInput={this.handleUpdateDetailsInput} type="update" />
      case "google":
        return <GoogleForm onValidInput={this.handleUpdateDetailsInput} type="update" />
      case "mqtt":
        return <MQTTForm onValidInput={this.handleUpdateDetailsInput} type="update" />
      case "http":
        return <HTTPForm onValidInput={this.handleUpdateDetailsInput} type="update" />
      default:
        return <AzureForm onValidInput={this.handleUpdateDetailsInput} type="update" />
    }
  }

  render() {
    const { loading, channel } = this.props.data

    if (loading) return <DashboardLayout />

    return(
      <DashboardLayout title={`Channel: ${channel.name}`}>
        <Text strong>
          Channel Details
        </Text>
        <br />
        <Input
          name="newName"
          placeholder={channel.name}
          value={this.state.newName}
          onChange={this.handleInputUpdate}
          style={{ width: 150 }}
        />
        <Button
          type="primary"
          onClick={this.handleNameChange}
        >
          Update
        </Button>
        <br />
        <Text>
          Type: {channel.type_name}
        </Text>
        <br />
        <Text>
          Active: {channel.active ? "Yes" : "No"}
        </Text>
        <br />
        <Text>
          ID: {channel.id}
        </Text>

        <div>
          {channel.type === "http" && <HttpDetails channel={channel} />}
        </div>


        <Text strong>
          Devices Piped
        </Text>
        <br />
        {
          channel.devices.map(d => (
            <Tag key={d.name}>
              {d.name}
            </Tag>
          ))
        }
        <br />
        {
          channel.default && <Text>
            Default Channel for New Devices
          </Text>
        }
        <br />
        {
          !channel.default && channel.devices.length === 0 && <Text>
            0 Connected Devices
          </Text>
        }
        <Checkbox checked={channel.show_dupes} onChange={this.handleShowDupesUpdate}>
          Show Duplicate Packets
        </Checkbox>

        {this.renderForm()}
        <Button
          type="primary"
          onClick={this.handleUpdateDetailsChange}
        >
          Update Details
        </Button>
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateChannel }, dispatch);
}

export default ChannelShow
