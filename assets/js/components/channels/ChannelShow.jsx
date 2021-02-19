import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import find from 'lodash/find'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import { primaryBlue } from '../../util/colors'
import { displayError } from '../../util/messages'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ChannelShowLabelsApplied from './ChannelShowLabelsApplied'
import ChannelPayloadTemplate from './ChannelPayloadTemplate'
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
import { CHANNEL_SHOW } from '../../graphql/channels'
import analyticsLogger from '../../util/analyticsLogger'
import withGql from '../../graphql/withGql'
import { Typography, Button, Input, Form, Tag, Checkbox, Card, Divider, Row, Col } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { isObject } from 'lodash';
import MqttDetails from './MqttDetails';
import { ChannelShowSkeleton } from './ChannelShowSkeleton';
const { Text, Paragraph } = Typography

class ChannelShow extends Component {
  state = {
    newName: "",
    credentials: {},
    selectedLabel: null,
    showChannelShowAddLabelModal: false,
    showChannelShowRemoveLabelModal: false,
    showDownlinkToken: false,
    templateBody: undefined,
    validInput: true,
  }

  componentDidMount() {
    const channelId = this.props.match.params.id
    analyticsLogger.logEvent("ACTION_NAV_CHANNEL_SHOW", {"id": channelId})

    const { socket } = this.props

    this.channel = socket.channel("graphql:channel_show", {})
    this.channel.join()
    this.channel.on(`graphql:channel_show:${channelId}:channel_update`, (message) => {
      this.props.channelShowQuery.refetch()
    })

    if (this.props.channelShowQuery.channel) {
      this.setState({ templateBody: this.props.channelShowQuery.channel.payload_template })
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.channelShowQuery.channel != this.props.channelShowQuery.channel) {
      this.setState({ templateBody: this.props.channelShowQuery.channel.payload_template })
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleUpdateDetailsInput = (credentials, validInput = true) => {
    this.setState({ credentials, validInput })
  }

  handleNameChange = () => {
    const { channel } = this.props.channelShowQuery
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_NAME", { "id": channel.id, "name": this.state.newName})
    this.props.updateChannel(channel.id, { name: this.state.newName })
    this.setState({ newName: ""})
  }

  handleChangeDownlinkToken = () => {
    const { channel } = this.props.channelShowQuery
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DOWNLINK_TOKEN", { "id": channel.id })
    this.props.updateChannel(channel.id, { downlink_token: "new" })
  }

  handleUpdateDetailsChange = () => {
    const { channel } = this.props.channelShowQuery
    const { credentials } = this.state

    if (Object.keys(credentials).length > 0) {
      analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DETAILS", { "id": channel.id})
      this.props.updateChannel(channel.id, { credentials })
      this.setState({ credentials: {} })
    } else {
      if (channel.type != "aws") {
        displayError("Integration details have not been updated, please update details before submitting")
      } else {
        displayError("Please make sure all form details are filled in properly")
      }
    }
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

  handleTemplateUpdate = (templateBody) => {
    this.setState({ templateBody });
  }

  updateChannelTemplate = () => {
    const { channel } = this.props.channelShowQuery
    this.props.updateChannel(channel.id, { payload_template: this.state.templateBody })
  }

  renderForm = () => {
    const { channel } = this.props.channelShowQuery

    switch (channel.type) {
      case "aws":
        return <AWSForm onValidInput={this.handleUpdateDetailsInput} type="update" channel={channel} />
      case "google":
        return <GoogleForm onValidInput={this.handleUpdateDetailsInput} type="update" channel={channel} />
      case "mqtt":
        return <MQTTForm onValidInput={this.handleUpdateDetailsInput} type="update" channel={channel} />
      case "http":
        return <HTTPForm onValidInput={this.handleUpdateDetailsInput} type="update" channel={channel} />
      default:
        return <AzureForm onValidInput={this.handleUpdateDetailsInput} type="update" channel={channel} />
    }
  }

  render() {
    const { loading, error, channel, allLabels } = this.props.channelShowQuery

    if (loading) return <ChannelShowSkeleton user={this.props.user} />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )
    const downlinkKey = channel.downlink_token || `{:downlink_key}`;

    let downlinkUrl = `http://localhost:4000/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`

    if (process.env.SELF_HOSTED && window.env_domain !== "localhost:4000") {
      downlinkUrl = `https://${window.env_domain}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`
    }
    if (!process.env.SELF_HOSTED && process.env.ENV_DOMAIN !== "localhost") {
      downlinkUrl = `https://${process.env.ENV_DOMAIN}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`
    }

    const { showDownlinkToken } = this.state

    return(
      <DashboardLayout
        title={`${channel.name}`}
        user={this.props.user}
        breadCrumbs={
          <div style={{ marginLeft: 4, paddingBottom: 0 }}>
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
              {
                channel.type === "mqtt" && (
                  <Card size="small" title="MQTT Details">
                    <MqttDetails channel={channel} />
                  </Card>
              )}
            </Col>
          </Row>
          {
            channel.type === 'http' && (
              <UserCan>
                <Divider />
                <Text>Downlink URL</Text>
                <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 16 }}>
                  <Input
                    value={downlinkUrl}
                    style={{ marginRight: 10 }}
                  />
                  <CopyToClipboard text={downlinkUrl}>
                    <Button onClick={() => {}} style={{ marginRight: 0 }} type="primary">Copy</Button>
                  </CopyToClipboard>
                </div>
                <Text>Downlink Key</Text>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Input
                    value={showDownlinkToken ? channel.downlink_token : "************************"}
                    style={{ marginRight: 10, color: '#38A2FF', fontFamily: 'monospace' }}
                    suffix={
                      showDownlinkToken ? (
                        <EyeOutlined onClick={() => this.setState({ showDownlinkToken: !showDownlinkToken })} />
                      ) : (
                        <EyeInvisibleOutlined onClick={() => this.setState({ showDownlinkToken: !showDownlinkToken })} />
                      )
                    }
                  />
                  <CopyToClipboard text={channel.downlink_token}>
                    <Button onClick={() => {}} style={{ marginRight: 10 }} type="primary">Copy</Button>
                  </CopyToClipboard>
                  <Button onClick={this.handleChangeDownlinkToken} style={{ marginRight: 0 }}>Generate New Key</Button>
                </div>
              </UserCan>
            )
          }
        </Card>

        <UserCan>
          <Card title="Update your Connection Details">
            {this.renderForm()}
            <Divider />
            <Button
              type="primary"
              onClick={this.handleUpdateDetailsChange}
              disabled={!this.state.validInput}
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

        {((channel.type == 'http' && channel.endpoint !== 'https://lora.mydevices.com/v1/networks/helium/uplink') || channel.type == 'mqtt') && (
          <ChannelPayloadTemplate
            templateBody={this.state.templateBody || ""}
            handleTemplateUpdate={this.handleTemplateUpdate}
            updateChannelTemplate={this.updateChannelTemplate}
            channel={channel}
            functions={channel.labels.map(l => find(allLabels, {id: l.id}).function).filter(f => f)}
          />
        )}

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

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateChannel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(ChannelShow, CHANNEL_SHOW, props => ({ fetchPolicy: 'cache-and-network', variables: { id: props.match.params.id }, name: 'channelShowQuery' }))
)
