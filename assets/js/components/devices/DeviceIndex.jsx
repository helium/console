import React, { Component } from 'react'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import NewDeviceModal from './NewDeviceModal'
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
      devicesToDelete: null,
    }
    this.openCreateDeviceModal = this.openCreateDeviceModal.bind(this)
    this.closeCreateDeviceModal = this.closeCreateDeviceModal.bind(this)
    this.openDeleteDeviceModal = this.openDeleteDeviceModal.bind(this)
    this.closeDeleteDeviceModal = this.closeDeleteDeviceModal.bind(this)
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

  openDeleteDeviceModal(devicesToDelete) {
    this.setState({ showDeleteDeviceModal: true, devicesToDelete })
  }

  closeDeleteDeviceModal() {
    this.setState({ showDeleteDeviceModal: false })
  }

  render() {
    const { showCreateDeviceModal, showDeleteDeviceModal } = this.state
    return(
      <DashboardLayout title="Devices">
        <DevicesTable
          openCreateDeviceModal={this.openCreateDeviceModal}
          openDeleteDeviceModal={this.openDeleteDeviceModal}
        />

        <NewDeviceModal open={showCreateDeviceModal} onClose={this.closeCreateDeviceModal}/>

        <DeleteDeviceModal
          open={showDeleteDeviceModal}
          onClose={this.closeDeleteDeviceModal}
          devicesToDelete={this.state.devicesToDelete}
        />
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
