import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import UpdateLabelModal from './UpdateLabelModal'
import LabelAddDeviceModal from './LabelAddDeviceModal'
import RemoveDevicesFromLabelModal from './RemoveDevicesFromLabelModal'
import LabelShowTable from './LabelShowTable'
import DashboardLayout from '../common/DashboardLayout'
import Sidebar from '../common/Sidebar'
import Debug from '../common/Debug'
import Downlink from '../common/Downlink'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import DownlinkImage from '../../../img/downlink.svg'
import { debugSidebarBackgroundColor } from '../../util/colors'
import { updateLabel, addDevicesToLabels, toggleLabelDebug, updateLabelNotificationSettings, updateLabelNotificationWebhooks } from '../../actions/label'
import { sendDownlinkMessage } from '../../actions/channel'
import { LABEL_SHOW, LABEL_UPDATE_SUBSCRIPTION } from '../../graphql/labels'
import { LABEL_DEBUG_EVENTS_SUBSCRIPTION } from '../../graphql/events'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import { Button, Typography } from 'antd';
import { BugOutlined, SettingOutlined, TagOutlined } from '@ant-design/icons';
import { SkeletonLayout } from '../common/SkeletonLayout';

const { Text } = Typography

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(LABEL_SHOW, queryOptions)
class LabelShow extends Component {
  state = {
    showUpdateLabelModal: false,
    showLabelAddDeviceModal: false,
    showRemoveDevicesFromLabelModal: false,
    devicesToRemove: [],
    showDebugSidebar: false,
    showDownlinkSidebar: false,
    selectedDevices: []
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_LABEL_SHOW")
    const { subscribeToMore, fetchMore } = this.props.data

    subscribeToMore({
      document: LABEL_UPDATE_SUBSCRIPTION,
      variables: { id: this.props.match.params.id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          variables: { id: this.props.match.params.id },
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  openUpdateLabelModal = () => {
    this.setState({ showUpdateLabelModal: true })
  }

  closeUpdateLabelModal = () => {
    this.setState({ showUpdateLabelModal: false })
  }

  openLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: true })
  }

  closeLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: false })
  }

  openRemoveDevicesFromLabelModal = (devicesToRemove) => {
    this.setState({ showRemoveDevicesFromLabelModal: true, devicesToRemove })
  }

  closeRemoveDevicesFromLabelModal = () => {
    this.setState({ showRemoveDevicesFromLabelModal: false })
  }

  devicesSelected = (selectedDevices) => {
    this.setState({selectedDevices});
  }

  handleUpdateLabel = (name, color) => {
    const labelId = this.props.match.params.id
    const attrs = name ? { name, color } : { color }
    this.props.updateLabel(labelId, attrs)
  }

  handleUpdateLabelMultiBuy = multiBuyValue => {
    const labelId = this.props.match.params.id
    const attrs = { multi_buy: multiBuyValue }
    this.props.updateLabel(labelId, attrs)
  }

  handleUpdateAdrSetting = adrValue => {
    const labelId = this.props.match.params.id
    const attrs = { adr_allowed: adrValue }
    this.props.updateLabel(labelId, attrs)
  }

  handleUpdateLabelNotificationSettings = notifications => {
    this.props.updateLabelNotificationSettings(notifications);
  }

  handleUpdateLabelNotificationWebhooks = webhooks => {
    this.props.updateLabelNotificationWebhooks(webhooks);
  }

  handleToggleDebug = () => {
    const { showDebugSidebar } = this.state

    if (!showDebugSidebar) {
      this.props.toggleLabelDebug(this.props.match.params.id)
      analyticsLogger.logEvent("ACTION_OPEN_LABEL_DEBUG", { "id": this.props.match.params.id })
    } else {
      analyticsLogger.logEvent("ACTION_CLOSE_LABEL_DEBUG", { "id": this.props.match.params.id })
    }
    this.setState({ showDebugSidebar: !showDebugSidebar })
  }

  handleToggleDownlink = () => {
    const { showDownlinkSidebar } = this.state;

    this.setState({ showDownlinkSidebar: !showDownlinkSidebar });
  }

  render() {
    const { loading, error, label } = this.props.data

    if (loading) return <DashboardLayout><SkeletonLayout/></DashboardLayout>
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const normalizedDevices = label.devices.reduce((map, device) => {
      map[device.id] = device
      return map
    }, {})

    return (
      <div>
        <DashboardLayout
          user={this.props.user}
          breadCrumbs={
            <div style={{ marginLeft: 4, paddingBottom: 0 }}>
              <Link to="/labels"><Text style={{ color: "#8C8C8C" }}>Labels&nbsp;&nbsp;/</Text></Link>
              <Text>&nbsp;&nbsp;{label.name}</Text>
            </div>
          }
          title={`${label.name}`}
          extra={
            <UserCan>
              <Button
                size="large"
                icon={<SettingOutlined />}
                style={{ borderRadius: 4 }}
                onClick={this.openUpdateLabelModal}
              >
                Label Settings
              </Button>
              <Button
                size="large"
                type="primary"
                onClick={this.openLabelAddDeviceModal}
                icon={<TagOutlined />}
                style={{ marginLeft: 20, borderRadius: 4 }}
              >
                Add this Label to a Device
              </Button>
            </UserCan>
          }
        >
          <LabelShowTable labelId={this.props.match.params.id} openRemoveDevicesFromLabelModal={this.openRemoveDevicesFromLabelModal} history={this.props.history} devicesSelected={this.devicesSelected}/>

          <UpdateLabelModal
            handleUpdateLabel={this.handleUpdateLabel}
            handleUpdateLabelMultiBuy={this.handleUpdateLabelMultiBuy}
            handleUpdateAdrSetting={this.handleUpdateAdrSetting}
            handleUpdateLabelNotificationSettings={this.handleUpdateLabelNotificationSettings}
            handleUpdateLabelNotificationWebhooks={this.handleUpdateLabelNotificationWebhooks}
            open={this.state.showUpdateLabelModal}
            onClose={this.closeUpdateLabelModal}
            label={label}
          />

          <LabelAddDeviceModal
            label={label}
            labelNormalizedDevices={normalizedDevices}
            addDevicesToLabels={this.props.addDevicesToLabels}
            open={this.state.showLabelAddDeviceModal}
            onClose={this.closeLabelAddDeviceModal}
          />

          <RemoveDevicesFromLabelModal
            label={label}
            open={this.state.showRemoveDevicesFromLabelModal}
            onClose={this.closeRemoveDevicesFromLabelModal}
            devicesToRemove={this.state.devicesToRemove}
          />

          <Sidebar
            show={this.state.showDebugSidebar}
            toggle={this.handleToggleDebug}
            sidebarIcon={<BugOutlined />}
            iconBackground={debugSidebarBackgroundColor}
            iconPosition='top'
            message='Access Debug mode to view device packet transfer'
          >
            <Debug
              subscription={LABEL_DEBUG_EVENTS_SUBSCRIPTION}
              variables={{ label_id: this.props.match.params.id }}
              refresh={() => this.props.toggleLabelDebug(this.props.match.params.id)}
              subscriptionKey="labelDebugEventAdded"
            />
          </Sidebar>

          <UserCan>
            {
              label &&
              <Sidebar
                show={this.state.showDownlinkSidebar}
                toggle={this.handleToggleDownlink}
                sidebarIcon={<img src={DownlinkImage}/>}
                iconBackground='#40A9FF'
                disabled={label.channels.filter(c => c.type === 'http').length === 0}
                disabledMessage='Please attach an HTTP integration to use Downlink'
                iconPosition='middle'
                message='Send a manual downlink using an HTTP integration'
              >
                <Downlink onSend={(payload, confirm, port) => {
                  analyticsLogger.logEvent("ACTION_DOWNLINK_SEND", { "channels": label.channels.map(c => c.id) });
                  this.props.sendDownlinkMessage(
                    payload,
                    port,
                    confirm,
                    this.state.selectedDevices.map(device => device.id),
                    label.channels
                  )
                }}/>
              </Sidebar>
            }
          </UserCan>
        </DashboardLayout>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateLabel, addDevicesToLabels, toggleLabelDebug, sendDownlinkMessage, updateLabelNotificationSettings, updateLabelNotificationWebhooks }, dispatch)
}

export default LabelShow
