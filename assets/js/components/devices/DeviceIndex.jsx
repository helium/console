import React, { Component } from 'react'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import NewDeviceModal from './NewDeviceModal'
import DeviceAddLabelsModal from './DeviceAddLabelsModal'
import DeleteDeviceModal from './DeleteDeviceModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Button } from 'antd';

class DeviceIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showCreateDeviceModal: false,
      showDeleteDeviceModal: false,
      showDeviceAddLabelsModal: false,
      devicesSelected: null,
    }
    this.openCreateDeviceModal = this.openCreateDeviceModal.bind(this)
    this.closeCreateDeviceModal = this.closeCreateDeviceModal.bind(this)
    this.openDeleteDeviceModal = this.openDeleteDeviceModal.bind(this)
    this.closeDeleteDeviceModal = this.closeDeleteDeviceModal.bind(this)
    this.openDeviceAddLabelsModal = this.openDeviceAddLabelsModal.bind(this)
    this.closeDeviceAddLabelsModal = this.closeDeviceAddLabelsModal.bind(this)
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DEVICES_INDEX")
  }

  openCreateDeviceModal() {
    this.setState({ showCreateDeviceModal: true })
  }

  closeCreateDeviceModal() {
    this.setState({ showCreateDeviceModal: false })
  }

  openDeviceAddLabelsModal(devicesSelected) {
    this.setState({ showDeviceAddLabelsModal: true, devicesSelected })
  }

  closeDeviceAddLabelsModal() {
    this.setState({ showDeviceAddLabelsModal: false })
  }

  openDeleteDeviceModal(devicesSelected) {
    this.setState({ showDeleteDeviceModal: true, devicesSelected })
  }

  closeDeleteDeviceModal() {
    this.setState({ showDeleteDeviceModal: false })
  }

  render() {
    const { showCreateDeviceModal, showDeleteDeviceModal, showDeviceAddLabelsModal } = this.state
    return(
      <DashboardLayout title="Devices">
        <DevicesTable
          openCreateDeviceModal={this.openCreateDeviceModal}
          openDeleteDeviceModal={this.openDeleteDeviceModal}
          openDeviceAddLabelsModal={this.openDeviceAddLabelsModal}
        />

        <NewDeviceModal open={showCreateDeviceModal} onClose={this.closeCreateDeviceModal}/>

        <DeviceAddLabelsModal
          open={showDeviceAddLabelsModal}
          onClose={this.closeDeviceAddLabelsModal}
          devicesToUpdate={this.state.devicesSelected}
        />

        <DeleteDeviceModal
          open={showDeleteDeviceModal}
          onClose={this.closeDeleteDeviceModal}
          devicesToDelete={this.state.devicesSelected}
        />
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
