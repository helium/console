import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import UpdateLabelModal from '../labels/UpdateLabelModal'
import LabelAddDeviceModal from '../labels/LabelAddDeviceModal'
import DeleteDeviceModal from './DeleteDeviceModal';
import RemoveDevicesFromLabelModal from '../labels/RemoveDevicesFromLabelModal'
import LabelShowTable from '../labels/LabelShowTable'
import UserCan from '../common/UserCan'
import { updateLabel, addDevicesToLabels, updateLabelNotificationSettings, updateLabelNotificationWebhooks } from '../../actions/label'
import { LABEL_SHOW } from '../../graphql/labels'
import withGql from '../../graphql/withGql'
import { Typography } from 'antd';
const { Text } = Typography

class DeviceIndexLabelShow extends Component {
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
    const labelId = this.props.id
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
    if (prevProps.id !== this.props.id) {
      this.channel.on(`graphql:label_show:${this.props.id}:label_update`, (message) => {
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
    const labelId = this.props.id
    const attrs = name ? { name, color } : { color }
    this.props.updateLabel(labelId, attrs)
  }

  handleUpdateLabelMultiBuy = multiBuyValue => {
    const labelId = this.props.id
    const attrs = { multi_buy: multiBuyValue }
    this.props.updateLabel(labelId, attrs)
  }

  handleUpdateLabelNotificationSettings = notifications => {
    this.props.updateLabelNotificationSettings(notifications);
  }

  handleUpdateLabelNotificationWebhooks = webhooks => {
    this.props.updateLabelNotificationWebhooks(webhooks);
  }

  render() {
    const { loading, error, label } = this.props.labelShowQuery
    const { showDeleteDeviceModal, selectedDevices } = this.state

    if (loading) return <div />
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const normalizedDevices = label.devices.reduce((map, device) => {
      map[device.id] = device
      return map
    }, {})

    return (
      <div>
        <LabelShowTable
          labelId={this.props.id}
          label={label}
          openRemoveDevicesFromLabelModal={this.openRemoveDevicesFromLabelModal}
          history={this.props.history}
          devicesSelected={this.setDevicesSelected}
          openDeleteDeviceModal={this.openDeleteDeviceModal}
          openLabelAddDeviceModal={this.openLabelAddDeviceModal}
          openUpdateLabelModal={this.openUpdateLabelModal}
        />

        <UpdateLabelModal
          handleUpdateLabel={this.handleUpdateLabel}
          handleUpdateLabelMultiBuy={this.handleUpdateLabelMultiBuy}
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
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateLabel, addDevicesToLabels, updateLabelNotificationSettings, updateLabelNotificationWebhooks }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(DeviceIndexLabelShow, LABEL_SHOW, props => ({ fetchPolicy: 'cache-first', variables: { id: props.id }, name: 'labelShowQuery' }))
)
