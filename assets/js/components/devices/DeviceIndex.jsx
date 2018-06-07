import React, { Component } from 'react'
import RandomDeviceButton from './RandomDeviceButton'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import userCan from '../../util/abilities'

// MUI
import Paper from '@material-ui/core/Paper';

class DeviceIndex extends Component {
  render() {
    return(
      <DashboardLayout title={"All Devices"}>
        <Paper>
          <DevicesTable />
        </Paper>

        {userCan('create', 'device') &&
          <RandomDeviceButton />
        }
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
