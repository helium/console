import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import OutsideClick from 'react-outside-click-handler';
import pick from 'lodash/pick'
import find from 'lodash/find'
import flatten from 'lodash/flatten'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import EventsDashboard from '../events/EventsDashboard'
import UserCan from '../common/UserCan'
import DashboardLayout from '../common/DashboardLayout'
import Debug from '../common/Debug'
import Downlink from '../common/Downlink'
import Sidebar from '../common/Sidebar'
import DeviceRemoveLabelModal from './DeviceRemoveLabelModal'
import DevicesAddLabelModal from './DevicesAddLabelModal'
import DeviceCredentials from './DeviceCredentials'
import DeviceShowStats from './DeviceShowStats'
import DeleteDeviceModal from './DeleteDeviceModal';
import { updateDevice } from '../../actions/device'
import { sendClearDownlinkQueue, fetchDownlinkQueue } from '../../actions/downlink'
import { sendDownlinkMessage } from '../../actions/channel'
import { DEVICE_SHOW } from '../../graphql/devices'
import analyticsLogger from '../../util/analyticsLogger'
import { displayError } from '../../util/messages'
import DownlinkImage from '../../../img/downlink.svg'
import { debugSidebarBackgroundColor } from '../../util/colors'
import withGql from '../../graphql/withGql'
import { Typography, Button, Input, Select, Tag, Card, Row, Col, Tabs, Switch, Popover } from 'antd';
import { EditOutlined, EyeOutlined, EyeInvisibleOutlined, BugOutlined, DeleteOutlined } from '@ant-design/icons';
import { DeviceShowSkeleton } from './DeviceShowSkeleton';
const { Text } = Typography
const { TabPane } = Tabs
const { Option } = Select
import DeviceShowLabelsTable from './DeviceShowLabelsTable';

class DeviceShow extends Component {
  state = {
    newName: "",
    newDevEUI: "",
    newAppEUI: "",
    newAppKey: "",
    showNameInput: false,
    showDevEUIInput: false,
    showAppEUIInput: false,
    showAppKeyInput: false,
    labelsSelected: null,
    showDeviceRemoveLabelModal: false,
    showDevicesAddLabelModal: false,
    showDeleteDeviceModal: false,
    showDebugSidebar: false,
    showDownlinkSidebar: false,
    deviceToDelete: null,
    showAppKey: false,
  }

  componentDidMount() {
    const deviceId = this.props.match.params.id
    analyticsLogger.logEvent("ACTION_NAV_DEVICE_SHOW", {"id": deviceId})

    const { socket } = this.props

    this.channel = socket.channel("graphql:device_show", {})
    this.channel.join()
    this.channel.on(`graphql:device_show:${deviceId}:device_update`, (message) => {
      this.props.deviceShowQuery.refetch()
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleDeviceNameUpdate = (id, e) => {
    const { newName } = this.state
    if (newName !== "") {
      this.props.updateDevice(id, { name: this.state.newName })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "name": newName })
    }
    this.setState({ newName: "", showNameInput: false })
  }

  handleDeviceEUIUpdate = (id) => {
    const { newDevEUI } = this.state
    if (newDevEUI.length === 16) {
      this.props.updateDevice(id, { dev_eui: this.state.newDevEUI.toUpperCase() })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "dev_eui": newDevEUI })
      return this.setState({ newDevEUI: "", showDevEUIInput: false })
    }
    if (newDevEUI === "") {
      this.setState({ newDevEUI: "", showDevEUIInput: false })
    } else {
      displayError(`Device EUI must be exactly 8 bytes long`)
    }
  }

  handleAppEUIUpdate = (id) => {
    const { newAppEUI } = this.state
    if (newAppEUI.length === 16) {
      this.props.updateDevice(id, { app_eui: this.state.newAppEUI.toUpperCase() })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "app_eui": newAppEUI })
      return this.setState({ newAppEUI: "", showAppEUIInput: false })
    }
    if (newAppEUI === "") {
      this.setState({ newAppEUI: "", showAppEUIInput: false })
    } else {
      displayError(`App EUI must be exactly 8 bytes long`)
    }
  }

  handleAppKeyUpdate = (id) => {
    const { newAppKey } = this.state
    if (newAppKey.length === 32) {
      this.props.updateDevice(id, { app_key: this.state.newAppKey.toUpperCase() })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "app_key": newAppKey })
      return this.setState({ newAppKey: "", showAppKeyInput: false })
    }
    if (newAppKey === "") {
      this.setState({ newAppKey: "", showAppKeyInput: false })
    } else {
      displayError(`App Key must be exactly 16 bytes long`)
    }
  }

  handleToggleDownlink = () => {
    const { showDownlinkSidebar } = this.state;

    this.setState({ showDownlinkSidebar: !showDownlinkSidebar });
  }

  handleToggleDebug = () => {
    const { showDebugSidebar } = this.state
    this.setState({ showDebugSidebar: !showDebugSidebar })
  }

  toggleNameInput = () => {
    const { showNameInput } = this.state
    this.setState({ showNameInput: !showNameInput })
  }

  toggleDevEUIInput = () => {
    const { showDevEUIInput } = this.state
    this.setState({ showDevEUIInput: !showDevEUIInput })
  }

  toggleAppEUIInput = () => {
    const { showAppEUIInput } = this.state
    this.setState({ showAppEUIInput: !showAppEUIInput })
  }

  toggleAppKeyInput = () => {
    const { showAppKeyInput } = this.state
    this.setState({ showAppKeyInput: !showAppKeyInput })
  }

  openDeviceRemoveLabelModal = (labelsSelected) => {
    this.setState({ showDeviceRemoveLabelModal: true, labelsSelected })
  }

  closeDeviceRemoveLabelModal = () => {
    this.setState({ showDeviceRemoveLabelModal: false })
  }

  openDevicesAddLabelModal = () => {
    this.setState({ showDevicesAddLabelModal: true })
  }

  closeDevicesAddLabelModal = () => {
    this.setState({ showDevicesAddLabelModal: false })
  }

  openDeleteDeviceModal = (device) => {
    this.setState({ showDeleteDeviceModal: true, deviceToDelete: [device] })
  }

  closeDeleteDeviceModal = () => {
    this.setState({ showDeleteDeviceModal: false })
  }

  toggleDeviceActive = (active) => {
    this.props.updateDevice(this.props.match.params.id, { active })
  }

  render() {
    const {
      newName,
      showNameInput,
      showDevEUIInput,
      showAppEUIInput,
      showAppKeyInput,
      showDeviceRemoveLabelModal,
      labelsSelected,
      showDevicesAddLabelModal,
      showDebugSidebar,
      showDeleteDeviceModal,
      deviceToDelete,
      showAppKey
    } = this.state
    const { loading, error, device } = this.props.deviceShowQuery;

    const channels = device && device.labels.reduce(
      (acc, label) => acc.concat(label.channels.filter(c => c.type === 'http')),
      []
    );

    if (loading) return <DeviceShowSkeleton user={this.props.user} />;
    if (error) return <Text>Data failed to load, please reload the page and try again</Text>
    const smallerText = device.total_packets > 10000

    return(
      <DashboardLayout
        title={`${device.name}`}
        user={this.props.user}
        breadCrumbs={
          <div style={{ marginLeft: 4, paddingBottom: 0 }}>
            <Link to="/devices"><Text style={{ color: "#8C8C8C" }}>Devices&nbsp;&nbsp;/</Text></Link>
            <Text>&nbsp;&nbsp;{device.name}</Text>
          </div>
        }
        extra={
          <UserCan>
            <Popover
              content={`This device is currently ${device.active ? "active" : "inactive"}`}
              placement="top"
              overlayStyle={{ width: 140 }}
            >
              <Switch
                checked={device.active}
                onChange={this.toggleDeviceActive}
              />
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                shape="circle"
                size="small"
                style={{ marginLeft: 8 }}
                onClick={e => {
                  e.stopPropagation()
                  this.openDeleteDeviceModal(device)
                }}
              />
            </Popover>
          </UserCan>
        }
      >
        <Row gutter={12} type="flex" style={{ overflow: 'scroll' }}>
          <Col span={15}>
          <Card title="Device Details" >
            <table>
              <tbody>
                <tr style={{height: '30px'}}>
                  <td style={{width: '200px'}}><Text strong>Name</Text></td>
                  <td>
                    {showNameInput ? (
                      <OutsideClick
                        onOutsideClick={this.toggleNameInput}
                      >
                        <Input
                          name="newName"
                          placeholder={device.name}
                          value={this.state.newName}
                          onChange={this.handleInputUpdate}
                          style={{ width: 200, marginRight: 5 }}
                        />
                        <Button
                          type="primary"
                          name="newName"
                          onClick={() => this.handleDeviceNameUpdate(device.id)}
                        >
                          Update
                        </Button>
                      </OutsideClick>
                    ) : (
                      <React.Fragment>
                        <Text  style={{ marginRight: 5 }}>{device.name} </Text>
                        <UserCan>
                          <Button size="small" onClick={this.toggleNameInput}>
                            <EditOutlined />
                          </Button>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td><Text strong>ID</Text></td>
                  <td><Text code>{device.id}</Text></td>
                </tr>
                <tr style={{height: '20px'}} />
                <tr style={{height: '30px'}}>
                  <td><Text strong>Device EUI</Text></td>
                  <td>
                    {showDevEUIInput && (
                      <OutsideClick
                        onOutsideClick={this.toggleDevEUIInput}
                      >
                        <Input
                          name="newDevEUI"
                          placeholder={device.dev_eui}
                          value={this.state.newDevEUI}
                          onChange={this.handleInputUpdate}
                          maxLength={16}
                          style={{ width: 200, marginRight: 5 }}
                        />
                        <Button
                          type="primary"
                          name="newDevEUI"
                          onClick={() => this.handleDeviceEUIUpdate(device.id)}
                        >
                          Update
                        </Button>
                      </OutsideClick>
                    )}
                    {!showDevEUIInput && (
                      <React.Fragment>
                        {
                          device.dev_eui && device.dev_eui.length === 16 ? <DeviceCredentials data={device.dev_eui} /> : <Text style={{ marginRight: 5 }}>Add a Device EUI</Text>
                        }
                        <UserCan>
                        <Button size="small" onClick={this.toggleDevEUIInput}>
                          <EditOutlined />
                        </Button>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td><Text strong>App EUI</Text></td>
                  <td>
                    {showAppEUIInput && (
                      <OutsideClick
                        onOutsideClick={this.toggleAppEUIInput}
                      >
                        <Input
                          name="newAppEUI"
                          placeholder={device.app_eui}
                          value={this.state.newAppEUI}
                          onChange={this.handleInputUpdate}
                          maxLength={16}
                          style={{ width: 200, marginRight: 5 }}
                        />
                        <Button
                          type="primary"
                          name="newAppEUI"
                          onClick={() => this.handleAppEUIUpdate(device.id)}
                        >
                          Update
                        </Button>
                      </OutsideClick>
                    )}
                    {!showAppEUIInput && (
                      <React.Fragment>
                        {
                          device.app_eui && device.app_eui.length === 16 ? <DeviceCredentials data={device.app_eui} /> : <Text style={{ marginRight: 5 }}>Add a App EUI</Text>
                        }
                        <UserCan>
                        <Button size="small" onClick={this.toggleAppEUIInput}>
                          <EditOutlined />
                        </Button>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <UserCan>
                  <tr style={{height: '30px'}}>
                    <td style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Text strong>App Key</Text>
                      {
                        showAppKey ? (
                          <EyeOutlined
                            onClick={() => this.setState({ showAppKey: !showAppKey })}
                            style={{ marginLeft: 5 }}
                          />
                        ) : (
                          <EyeInvisibleOutlined
                            onClick={() => this.setState({ showAppKey: !showAppKey })}
                            style={{ marginLeft: 5 }}
                          />
                        )
                      }
                    </td>
                    <td>
                      {showAppKeyInput && (
                        <OutsideClick
                          onOutsideClick={this.toggleAppKeyInput}
                        >
                          <Input
                            name="newAppKey"
                            placeholder={device.app_key}
                            value={this.state.newAppKey}
                            onChange={this.handleInputUpdate}
                            maxLength={32}
                            style={{ width: 300, marginRight: 5 }}
                          />
                          <Button
                            type="primary"
                            name="newAppKey"
                            onClick={() => this.handleAppKeyUpdate(device.id)}
                          >
                            Update
                          </Button>
                        </OutsideClick>
                      )}
                      {!showAppKeyInput && showAppKey && (
                        <React.Fragment>
                          {
                            device.app_key && device.app_key.length === 32 ? <DeviceCredentials data={device.app_key} /> : <Text style={{ marginRight: 5 }}>Add a App Key</Text>
                          }
                          <Button size="small" onClick={this.toggleAppKeyInput}>
                            <EditOutlined />
                          </Button>
                        </React.Fragment>
                      )}
                      {!showAppKeyInput && !showAppKey && (
                        <Text code>************************</Text>
                      )}
                    </td>
                  </tr>
                </UserCan>
                <tr style={{height: '20px'}} />
                <tr style={{height: '30px'}}>
                  <td style={{width: '150px'}}><Text strong>Activation Method</Text></td>
                  <td><Tag style={{fontWeight: 500, fontSize: 14}} color="#9254DE">OTAA</Tag></td>
                </tr>
              </tbody>
            </table>
          </Card>
          </Col>

          <Col span={9}>
            <DeviceShowStats device={device} smallerText={smallerText} />
          </Col>
        </Row>

        <DeviceShowLabelsTable
          deviceId={this.props.match.params.id}
          history={this.props.history}
          openRemoveLabelFromDeviceModal={this.openDeviceRemoveLabelModal}
          openDevicesAddLabelModal={this.openDevicesAddLabelModal}
        />

        <Card title="Real Time Packets"
          bodyStyle={{padding: 0, overflowX: "scroll" }}
        >
          <EventsDashboard device_id={device.id} />
        </Card>

        <DeviceRemoveLabelModal
          open={showDeviceRemoveLabelModal}
          onClose={this.closeDeviceRemoveLabelModal}
          labels={labelsSelected}
          device={device}
        />

        <DevicesAddLabelModal
          open={showDevicesAddLabelModal}
          onClose={this.closeDevicesAddLabelModal}
          devicesToUpdate={[device]}
        />

        <DeleteDeviceModal
          open={showDeleteDeviceModal}
          onClose={this.closeDeleteDeviceModal}
          allDevicesSelected={false}
          devicesToDelete={this.state.deviceToDelete}
          totalDevices={1}
          from="deviceShow"
        />

        <Sidebar
          show={showDebugSidebar}
          toggle={this.handleToggleDebug}
          sidebarIcon={<BugOutlined />}
          iconBackground={debugSidebarBackgroundColor}
          iconPosition='top'
          message='Access Debug mode to view device packet transfer'
        >
          <Debug
            deviceId={this.props.match.params.id}
          />
        </Sidebar>

        <UserCan>
            {
              <Sidebar
                show={this.state.showDownlinkSidebar}
                toggle={this.handleToggleDownlink}
                sidebarIcon={<img src={DownlinkImage}/>}
                iconBackground='#40A9FF'
                iconPosition='middle'
                message='Send a manual downlink using an HTTP integration'
                disabled={channels.length === 0}
                disabledMessage='Please attach a label with an HTTP integration to use Downlink'
              >
                <Downlink
                  src="DeviceShow"
                  id={device.id}
                  devices={[device]}
                  socket={this.props.socket}
                  onSend={(payload, confirm, port, position) => {
                    analyticsLogger.logEvent("ACTION_DOWNLINK_SEND", { "channels": channels.map(c => c.id) });
                    this.props.sendDownlinkMessage(
                      payload,
                      port,
                      confirm,
                      position,
                      device.id,
                      channels
                    )
                  }}
                  onClear={() => {
                    analyticsLogger.logEvent("ACTION_CLEAR_DOWNLINK_QUEUE", { "devices": [device.id] });
                    this.props.sendClearDownlinkQueue({ device_id: device.id });
                  }}
                  fetchDownlinkQueue={() => this.props.fetchDownlinkQueue(device.id, "device")}
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
  return bindActionCreators({ updateDevice, sendClearDownlinkQueue, sendDownlinkMessage, fetchDownlinkQueue }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(DeviceShow, DEVICE_SHOW, props => ({ fetchPolicy: 'cache-first', variables: { id: props.match.params.id }, name: 'deviceShowQuery' }))
)
