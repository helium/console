import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import OutsideClick from 'react-outside-click-handler';
import pick from 'lodash/pick'
import find from 'lodash/find'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import EventsDashboard from '../events/EventsDashboard'
import UserCan from '../common/UserCan'
import DashboardLayout from '../common/DashboardLayout'
import DeviceShowTable from './DeviceShowTable'
import DeviceRemoveLabelModal from './DeviceRemoveLabelModal'
import DevicesAddLabelModal from './DevicesAddLabelModal'
import DeviceCredentials from './DeviceCredentials'
import { updateDevice } from '../../actions/device'
import { DEVICE_UPDATE_SUBSCRIPTION, DEVICE_SHOW } from '../../graphql/devices'
import analyticsLogger from '../../util/analyticsLogger'
import { displayError } from '../../util/messages'
import { blueForDeviceStatsLarge } from '../../util/colors'
import { graphql } from 'react-apollo';
import { Typography, Button, Input, Icon, Select, Tag, Card, Row, Col, Tabs } from 'antd';
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
    } = this.state
    const { loading, error, device } = this.props.data

    if (loading) return <DashboardLayout />
    if (error) return <Text>Data failed to load, please reload the page and try again</Text>

    return(
      <DashboardLayout title={`${device.name}`}>
        <Row gutter={{ xs: 4, sm: 8, md: 12, lg: 16 }} type="flex">
          <Col span={16}>
          <Card title="Device Details">
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
                          <Tag color="blue" size="small" onClick={this.toggleNameInput}>
                            <Icon type="edit"></Icon>
                          </Tag>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td style={{paddingBottom: '20px'}}><Text strong>UUID</Text></td>
                  <td style={{paddingBottom: '20px'}}>{device.id}</td>
                </tr>
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
                        <Tag color="blue" size="small" onClick={this.toggleDevEUIInput}>
                          <Icon type="edit"></Icon>
                        </Tag>
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
                        <Tag color="blue" size="small" onClick={this.toggleAppEUIInput}>
                          <Icon type="edit"></Icon>
                        </Tag>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td style={{paddingBottom: '20px'}}><Text strong>App Key</Text></td>
                  <td style={{paddingBottom: '20px'}}>
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
                        <Tag color="blue" size="small" onClick={this.toggleAppKeyInput}>
                          <Icon type="edit"></Icon>
                        </Tag>
                        </UserCan>
                      </React.Fragment>
                    )}
                  </td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td style={{width: '150px'}}><Text strong>Activation Method</Text></td>
                  <td><Tag color="green">OTAA</Tag></td>
                </tr>
                <tr style={{height: '30px'}}>
                  <td><Text strong>LoRaWAN US Channels</Text></td>
                  <td><Text>48-55 (sub-band 7)</Text></td>
                </tr>
              </tbody>
            </table>
          </Card>
          </Col>

          <Col span={8}>
          <Card
            title={
              <Tabs defaultActiveKey="1" tabBarStyle={{ marginBottom: 0, position: 'relative', top: -2.5, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <TabPane tab={<span><Icon type="wifi" />Packets Transferred</span>} key="1"/>
                <TabPane tab={<span>Data Credits Used</span>} key="2" disabled/>
              </Tabs>
            }
            style={{ height: 'calc(100% - 20px)' }}
            headStyle={{ paddingLeft: 0, paddingRight: 0, borderBottom: '0px solid'}}
          >
            <Col span={12}>
              <Text style={{ fontSize: 16, fontFamily: 'soleil-light' }}>All Time</Text><br/>
              <Text style={{ fontSize: 46, color: blueForDeviceStatsLarge, position: 'relative', top: -15 }}>{device.total_packets}</Text><br/>
              <div style={{ marginBottom: 30 }} />
              <Text style={{ fontSize: 16, fontFamily: 'soleil-light' }}>Last 30 Days</Text><br/>
              <Text style={{ fontSize: 46, color: blueForDeviceStatsLarge, position: 'relative', top: -15 }}>{device.packets_last_30d}</Text><br/>
            </Col>
            <Col span={12}>
              <Text style={{ fontSize: 16, fontFamily: 'soleil-light' }}>Last 7 Days</Text><br/>
              <Text style={{ fontSize: 46, color: blueForDeviceStatsLarge, position: 'relative', top: -15 }}>{device.packets_last_7d}</Text><br/>
              <div style={{ marginBottom: 30 }} />
              <Text style={{ fontSize: 16, fontFamily: 'soleil-light' }}>Last 24 Hours</Text><br/>
              <Text style={{ fontSize: 46, color: blueForDeviceStatsLarge, position: 'relative', top: -15 }}>{device.packets_last_1d}</Text><br/>
            </Col>
          </Card>
          </Col>
        </Row>

        <DeviceShowTable
          labels={device.labels}
          device={device}
          openDeviceRemoveLabelModal={this.openDeviceRemoveLabelModal}
          openDevicesAddLabelModal={this.openDevicesAddLabelModal}
        />

        <Card title="Device Integrations">
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
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice }, dispatch)
}

export default DeviceShow
