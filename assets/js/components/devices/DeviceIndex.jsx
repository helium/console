import React, { Component } from 'react'
import NewDeviceButton from './NewDeviceButton'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import NewDeviceModal from './NewDeviceModal'
import UserCan from '../common/UserCan'

// MUI
import Paper from '@material-ui/core/Paper';

class DeviceIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showModal: false
    }
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose() {
    this.setState({ showModal: false })
  }

  render() {
    const { showModal } = this.state
    return(
      <DashboardLayout title="All Devices">
        <Paper>
          <DevicesTable />
        </Paper>

        <NewDeviceModal open={showModal} onClose={this.handleClose}/>

        <UserCan action="create" itemType="device">
          <NewDeviceButton handleClick={() => this.setState({ showModal: true })} />
        </UserCan>
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
