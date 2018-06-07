import React, { Component } from 'react'
import RandomDeviceButton from './RandomDeviceButton'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'

// MUI
import Paper from '@material-ui/core/Paper';

class DeviceIndex extends Component {
  render() {
    return(
      <DashboardLayout title="All Devices">
        <Paper>
          <DevicesTable />
        </Paper>

        <UserCan action="create" itemType="device">
          <RandomDeviceButton />
        </UserCan>
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
