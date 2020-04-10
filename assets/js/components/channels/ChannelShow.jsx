import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import find from 'lodash/find'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import { displayError } from '../../util/messages'
import ChannelShowLabelsApplied from './ChannelShowLabelsApplied'
import ChannelShowAddLabelModal from './ChannelShowAddLabelModal'
import ChannelShowRemoveLabelModal from './ChannelShowRemoveLabelModal'
import HttpDetails from './HttpDetails'
import AwsDetails from './AwsDetails'
import AzureForm from './forms/AzureForm.jsx'
import AWSForm from './forms/AWSForm.jsx'
import GoogleForm from './forms/GoogleForm.jsx'
import MQTTForm from './forms/MQTTForm.jsx'
import HTTPForm from './forms/HTTPForm.jsx'
import { updateChannel } from '../../actions/channel'
import { CHANNEL_SHOW, CHANNEL_UPDATE_SUBSCRIPTION } from '../../graphql/channels'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import { Typography, Button, Input, Form, Tag, Checkbox, Card, Divider, Row, Col } from 'antd';
const { Text, Paragraph } = Typography

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(CHANNEL_SHOW, queryOptions)
@connect(null, mapDispatchToProps)
class ChannelShow extends Component {
  state = {
    newName: "",
    credentials: {},
    selectedLabel: null,
    showChannelShowAddLabelModal: false,
    showChannelShowRemoveLabelModal: false,
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

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleUpdateDetailsInput = (credentials) => {
    this.setState({ credentials })
  }

  handleNameChange = () => {
    const { channel } = this.props.data
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_NAME", { "id": channel.id, "name": this.state.newName})
    this.props.updateChannel(channel.id, { name: this.state.newName })
    this.setState({ newName: ""})
  }

  handleUpdateDetailsChange = () => {
    const { channel } = this.props.data
    const { credentials } = this.state
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DETAILS", { "id": channel.id})
    this.props.updateChannel(channel.id, { credentials })
    this.setState({ credentials: {} })
  }

  handleSelectLabel = (selectedLabel) => {
    this.setState({ selectedLabel })
  }

  handleOpenChannelShowAddLabelModal = () => {
    const { selectedLabel } = this.state

    if (!selectedLabel) {
      displayError("Please select a label to add to this integration.")
    } else {
      this.setState({ showChannelShowAddLabelModal: true })
    }
  }

  handleCloseChannelShowAddLabelModal = () => {
    this.setState({ showChannelShowAddLabelModal: false })
  }

  handleOpenChannelShowRemoveLabelModal = (selectedLabel) => {
    this.setState({ showChannelShowRemoveLabelModal: true, selectedLabel })
  }

  handleCloseChannelShowRemoveLabelModal = () => {
    this.setState({ showChannelShowRemoveLabelModal: false })
  }

  renderForm = () => {
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
    const { loading, error, channel, allLabels } = this.props.data

    if (loading) return <DashboardLayout />
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return(
      <DashboardLayout
        title={`Integration: ${channel.name}`}
        breadCrumbs={
          <div style={{ marginLeft: 4, paddingBottom: 20 }}>
            <Link to="/integrations"><Text style={{ color: "#8C8C8C" }}>Integrations&nbsp;&nbsp;/</Text></Link>
            <Text>&nbsp;&nbsp;{channel.name}</Text>
          </div>
        }
      >
      <Card title="Integration Details">
        <UserCan alternate={<Text strong>{channel.name}</Text>}>
          <Input
            name="newName"
            placeholder={channel.name}
            value={this.state.newName}
            onChange={this.handleInputUpdate}
            style={{ width: 150, marginRight: 5 }}
          />
          <Button
            type="primary"
            onClick={this.handleNameChange}
          >
            Update
          </Button>
        </UserCan>
        <Divider />
        <Row>
          <Col span={12}>
          <Paragraph><Text strong>Type: </Text><Text>{channel.type_name}</Text></Paragraph>
          <Paragraph><Text strong>Active:</Text><Text> {channel.active ? "Yes" : "No"}</Text></Paragraph>
          <Paragraph><Text strong> ID: </Text><Text code>{channel.id}</Text></Paragraph>
          <Paragraph><Text strong> Devices Piped-- </Text></Paragraph>
          <Paragraph>{channel.devices.length} Connected Devices</Paragraph>
          </Col>
          <Col span={12}>
            {channel.type === "http" && (
              <Card size="small" title="HTTP Details">
                 <HttpDetails channel={channel} />
              </Card>
            )}
            {channel.type === "aws" && (
              <Card size="small" title="AWS Details">
                 <AwsDetails channel={channel} />
              </Card>
            )}
          </Col>
        </Row>
        </Card>

        <UserCan>
          <Card title="Update your Connection Details">
            {this.renderForm()}
            <Divider />
            <Button
              type="primary"
              onClick={this.handleUpdateDetailsChange}
            >
              Update Details
            </Button>
          </Card>
        </UserCan>

        <ChannelShowLabelsApplied
          handleSelectLabel={this.handleSelectLabel}
          allLabels={allLabels}
          channel={channel}
          handleClickAdd={this.handleOpenChannelShowAddLabelModal}
          handleClickRemove={this.handleOpenChannelShowRemoveLabelModal}
        />

        <ChannelShowAddLabelModal
          open={this.state.showChannelShowAddLabelModal}
          onClose={this.handleCloseChannelShowAddLabelModal}
          label={find(allLabels, { id: this.state.selectedLabel })}
          channel={channel}
        />

        <ChannelShowRemoveLabelModal
          open={this.state.showChannelShowRemoveLabelModal}
          onClose={this.handleCloseChannelShowRemoveLabelModal}
          label={find(allLabels, { id: this.state.selectedLabel })}
          channel={channel}
        />
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateChannel }, dispatch);
}

export default ChannelShow
