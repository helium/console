import React, { Component } from 'react'
import DeviceIndexTable from './DeviceIndexTable'
import DashboardLayout from '../common/DashboardLayout'
import NewDeviceModal from './NewDeviceModal'
import DevicesAddLabelModal from './DevicesAddLabelModal'
import DeleteDeviceModal from './DeleteDeviceModal'
import DeviceRemoveLabelModal from './DeviceRemoveLabelModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Button } from 'antd';

class DeviceIndex extends Component {
  state = {
    showCreateDeviceModal: false,
    showDeleteDeviceModal: false,
    showDevicesAddLabelModal: false,
    showDevicesRemoveLabelModal: false,
    devicesSelected: null,
    labelsSelected: null,
    deviceToRemoveLabel: null,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DEVICES_INDEX")
  }

  openCreateDeviceModal = () => {
    this.setState({ showCreateDeviceModal: true })
  }

  closeCreateDeviceModal = () => {
    this.setState({ showCreateDeviceModal: false })
  }

  openDevicesAddLabelModal = (devicesSelected) => {
    this.setState({ showDevicesAddLabelModal: true, devicesSelected })
  }

  closeDevicesAddLabelModal = () => {
    this.setState({ showDevicesAddLabelModal: false, devicesSelected: null })
  }

  openDevicesRemoveLabelModal = (labelsSelected, deviceToRemoveLabel) => {
    this.setState({ showDevicesRemoveLabelModal: true, labelsSelected, deviceToRemoveLabel })
  }

  closeDevicesRemoveLabelModal = () => {
    this.setState({ showDevicesRemoveLabelModal: false, labelsSelected: null, deviceToRemoveLabel: null })
  }

  openDeleteDeviceModal = (devicesSelected) => {
    this.setState({ showDeleteDeviceModal: true, devicesSelected })
  }

  closeDeleteDeviceModal = () => {
    this.setState({ showDeleteDeviceModal: false, devicesSelected: null })
  }

  render() {
    const { showCreateDeviceModal, showDeleteDeviceModal, showDevicesAddLabelModal, showDevicesRemoveLabelModal, labelsSelected, deviceToRemoveLabel } = this.state
    return(
      <DashboardLayout title="Devices">
        <DeviceIndexTable
          openCreateDeviceModal={this.openCreateDeviceModal}
          openDeleteDeviceModal={this.openDeleteDeviceModal}
          openDevicesAddLabelModal={this.openDevicesAddLabelModal}
          openDevicesRemoveLabelModal={this.openDevicesRemoveLabelModal}
          clearTable={this.state.devicesSelected == null}
        />

        <NewDeviceModal open={showCreateDeviceModal} onClose={this.closeCreateDeviceModal}/>

        <DevicesAddLabelModal
          open={showDevicesAddLabelModal}
          onClose={this.closeDevicesAddLabelModal}
          devicesToUpdate={this.state.devicesSelected}
        />

        <DeviceRemoveLabelModal
          open={showDevicesRemoveLabelModal}
          onClose={this.closeDevicesRemoveLabelModal}
          labels={labelsSelected}
          device={deviceToRemoveLabel}
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
