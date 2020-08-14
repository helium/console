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
import Sidebar from '../common/Sidebar'
import DeviceShowLabelsAttached from './DeviceShowLabelsAttached'
import DeviceRemoveLabelModal from './DeviceRemoveLabelModal'
import DevicesAddLabelModal from './DevicesAddLabelModal'
import DeviceCredentials from './DeviceCredentials'
import { updateDevice, toggleDeviceDebug } from '../../actions/device'
import { DEVICE_UPDATE_SUBSCRIPTION, DEVICE_SHOW } from '../../graphql/devices'
import { EVENTS_SUBSCRIPTION } from '../../graphql/events'
import analyticsLogger from '../../util/analyticsLogger'
import { displayError } from '../../util/messages'
import { blueForDeviceStatsLarge } from '../../util/colors'
import { graphql } from 'react-apollo';
import { Typography, Button, Input, Icon, Select, Tag, Card, Row, Col, Tabs, Switch, Popover } from 'antd';
const { Text } = Typography
const { TabPane } = Tabs
const { Option } = Select

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(DEVICE_SHOW, queryOptions)
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
    showDebugSidebar: false,
  }

  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data
    const deviceId = this.props.match.params.id

    analyticsLogger.logEvent("ACTION_NAV_DEVICE_SHOW", {"id": deviceId})

    subscribeToMore({
      document: DEVICE_UPDATE_SUBSCRIPTION,
      variables: { deviceId },
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

  handleToggleDebug = () => {
    const { showDebugSidebar } = this.state

    if (!showDebugSidebar) {
      this.props.toggleDeviceDebug(this.props.match.params.id)
      analyticsLogger.logEvent("ACTION_OPEN_DEVICE_DEBUG", { "id": this.props.match.params.id })
    } else {
      analyticsLogger.logEvent("ACTION_CLOSE_DEVICE_DEBUG", { "id": this.props.match.params.id })
    }
    this.setState({ showDebugSidebar: !showDebugSidebar })
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
    } = this.state
    const { loading, error, device } = this.props.data

    if (loading) return <DashboardLayout />
    if (error) return <Text>Data failed to load, please reload the page and try again</Text>

    return(
      <DashboardLayout
        title={`${device.name}`}
        breadCrumbs={
          <div style={{ marginLeft: 4, paddingBottom: 0 }}>
            <Link to="/devices"><Text style={{ color: "#8C8C8C" }}>Devices&nbsp;&nbsp;/</Text></Link>
            <Text>&nbsp;&nbsp;{device.name}</Text>
          </div>
        }
      >
        <Row gutter={{ xs: 4, sm: 8, md: 12, lg: 16 }} type="flex" style={{ overflow: 'scroll' }}>
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
                            <Icon type="edit"></Icon>
                          </Button>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td><Text strong>UUID</Text></td>
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
                          <Icon type="edit"></Icon>
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
                          <Icon type="edit"></Icon>
                        </Button>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td><Text strong>App Key</Text></td>
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
                    {!showAppKeyInput && (
                      <React.Fragment>
                        {
                          device.app_key && device.app_key.length === 32 ? <DeviceCredentials data={device.app_key} /> : <Text style={{ marginRight: 5 }}>Add a App Key</Text>
                        }
                        <UserCan>
                        <Button size="small" onClick={this.toggleAppKeyInput}>
                          <Icon type="edit"></Icon>
                        </Button>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <tr style={{height: '20px'}} />
                <tr style={{height: '30px'}}>
                  <td style={{width: '150px'}}><Text strong>Activation Method</Text></td>
                  <td><Tag style={{fontWeight: 500, fontSize: 14}} color="#9254DE">OTAA</Tag></td>
                </tr>
                <tr style={{height: '20px'}} />
                <tr style={{height: '30px'}}>
                  <td><Text strong>Attached Labels</Text></td>
                  <td>
                    <DeviceShowLabelsAttached
                      labels={device.labels}
                      openDeviceRemoveLabelModal={this.openDeviceRemoveLabelModal}
                      openDevicesAddLabelModal={this.openDevicesAddLabelModal}
                    />
                  </td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td><Text strong>Associated Integrations</Text></td>
                  <td>
                    {flatten(device.labels.map(l => l.channels)).map(c => c.name).join(", ")}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
          </Col>


          <Col span={9}>
            <Card
              title="Packets Transferred"
              style={{ height: 'calc(100% - 20px)', minWidth: 300 }}
            >
              <Col span={12}>
                <Text style={{ fontSize: 16, fontWeight: '300' }}>All Time</Text><br/>
                <Text style={{ fontSize: 46, color: blueForDeviceStatsLarge, position: 'relative', top: -15 }}>{device.total_packets}</Text><br/>
                <div style={{ marginBottom: 30 }} />
                <Text style={{ fontSize: 16, fontWeight: '300' }}>Last 30 Days</Text><br/>
                <Text style={{ fontSize: 46, color: blueForDeviceStatsLarge, position: 'relative', top: -15 }}>{device.packets_last_30d}</Text><br/>
              </Col>
              <Col span={12}>
                <Text style={{ fontSize: 16, fontWeight: '300' }}>Last 7 Days</Text><br/>
                <Text style={{ fontSize: 46, color: blueForDeviceStatsLarge, position: 'relative', top: -15 }}>{device.packets_last_7d}</Text><br/>
                <div style={{ marginBottom: 30 }} />
                <Text style={{ fontSize: 16, fontWeight: '300' }}>Last 24 Hours</Text><br/>
                <Text style={{ fontSize: 46, color: blueForDeviceStatsLarge, position: 'relative', top: -15 }}>{device.packets_last_1d}</Text><br/>
              </Col>
            </Card>
          </Col>
        </Row>

        <Card title="Device Integrations"

        bodyStyle={{padding: 0}}>
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

        <UserCan>
          <Sidebar
            show={showDebugSidebar}
            toggle={this.handleToggleDebug}
            sidebarIcon={<Icon type="bug" />}
            iconPosition='top'
          >
            <Debug
              subscription={EVENTS_SUBSCRIPTION}
              variables={{ device_id: this.props.match.params.id }}
              subscriptionKey="eventAdded"
              refresh={() => this.props.toggleDeviceDebug(this.props.match.params.id)}
            />
          </Sidebar>
        </UserCan>
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice, toggleDeviceDebug }, dispatch)
}

export default DeviceShow
