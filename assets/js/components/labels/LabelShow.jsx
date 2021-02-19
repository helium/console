import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import UpdateLabelModal from './UpdateLabelModal'
import LabelAddDeviceModal from './LabelAddDeviceModal'
import DeleteDeviceModal from '../devices/DeleteDeviceModal';
import RemoveDevicesFromLabelModal from './RemoveDevicesFromLabelModal'
import LabelShowTable from './LabelShowTable'
import LabelShowFunctionsAttached from './LabelShowFunctionsAttached'
import LabelShowChannelsAttached from './LabelShowChannelsAttached'
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
import { sendClearDownlinkQueue } from '../../actions/device'
import { LABEL_SHOW } from '../../graphql/labels'
import analyticsLogger from '../../util/analyticsLogger'
import withGql from '../../graphql/withGql'
import { Button, Typography } from 'antd';
import { BugOutlined, SettingOutlined, TagOutlined } from '@ant-design/icons';
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography

class LabelShow extends Component {
  state = {
    showUpdateLabelModal: false,
    showLabelAddDeviceModal: false,
    showDeleteDeviceModal: false,
    showRemoveDevicesFromLabelModal: false,
    showDebugSidebar: false,
    showDownlinkSidebar: false,
    selectedDevices: []
  }

  componentDidMount() {
    const labelId = this.props.match.params.id
    analyticsLogger.logEvent("ACTION_NAV_LABEL_SHOW")

    const { socket } = this.props

    this.channel = socket.channel("graphql:label_show", {})
    this.channel.join()
    this.channel.on(`graphql:label_show:${labelId}:label_update`, (message) => {
      this.props.labelShowQuery.refetch()
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.channel.on(`graphql:label_show:${this.props.match.params.id}:label_update`, (message) => {
        this.props.labelShowQuery.refetch()
      })
    }
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

  openRemoveDevicesFromLabelModal = selectedDevices => {
    this.setState({ showRemoveDevicesFromLabelModal: true, selectedDevices })
  }

  closeRemoveDevicesFromLabelModal = () => {
    this.setState({ showRemoveDevicesFromLabelModal: false })
  }

  openDeleteDeviceModal = selectedDevices => {
    this.setState({ showDeleteDeviceModal: true, selectedDevices })
  }

  closeDeleteDeviceModal = () => {
    this.setState({ showDeleteDeviceModal: false })
  }

  setDevicesSelected = (selectedDevices) => {
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
    const { loading, error, label } = this.props.labelShowQuery
    const { showDeleteDeviceModal, selectedDevices } = this.state

    if (loading) return <DashboardLayout user={this.props.user}><SkeletonLayout/></DashboardLayout>
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const normalizedDevices = label.devices.reduce((map, device) => {
      map[device.id] = device
      return map
    }, {})

    return (
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
        <LabelShowTable
          labelId={this.props.match.params.id}
          openRemoveDevicesFromLabelModal={this.openRemoveDevicesFromLabelModal}
          history={this.props.history}
          devicesSelected={this.setDevicesSelected}
          openDeleteDeviceModal={this.openDeleteDeviceModal}
        />

        <LabelShowChannelsAttached channels={label.channels} label={label}/>

        <LabelShowFunctionsAttached label={label} func={label.function}/>

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
          devicesToRemove={selectedDevices}
        />

        <DeleteDeviceModal
          label={label}
          open={showDeleteDeviceModal}
          onClose={this.closeDeleteDeviceModal}
          allDevicesSelected={false}
          devicesToDelete={selectedDevices}
          totalDevices={selectedDevices.length}
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
            labelId={this.props.match.params.id}
            refresh={() => this.props.toggleLabelDebug(this.props.match.params.id)}
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
              <Downlink 
                src="LabelShow" 
                onSend={(payload, confirm, port, position) => {
                  analyticsLogger.logEvent("ACTION_DOWNLINK_SEND", { "channels": label.channels.map(c => c.id) });
                  this.props.sendDownlinkMessage(
                    payload,
                    port,
                    confirm,
                    position,
                    this.state.selectedDevices.map(device => device.id),
                    label.channels
                  )
                }}
                onClear={() => {
                  analyticsLogger.logEvent("ACTION_CLEAR_DOWNLINK_QUEUE", { "devices": this.state.selectedDevices.map(device => device.id) });
                  this.props.sendClearDownlinkQueue(this.state.selectedDevices.map(device => device.id));
                }}
              />
            </Sidebar>
          }
        </UserCan>
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
  return bindActionCreators({ updateLabel, addDevicesToLabels, toggleLabelDebug, sendDownlinkMessage, sendClearDownlinkQueue, updateLabelNotificationSettings, updateLabelNotificationWebhooks }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(LabelShow, LABEL_SHOW, props => ({ fetchPolicy: 'cache-and-network', variables: { id: props.match.params.id }, name: 'labelShowQuery' }))
)
