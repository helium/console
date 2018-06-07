import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import RandomDeviceButton from './RandomDeviceButton'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import BlankSlate from '../common/BlankSlate'
import userCan from '../../util/abilities'

// MUI
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

class DeviceIndex extends Component {
  render() {
    const { deleteDevice } = this.props

    // if (loading) return <DashboardLayout title={"All Devices"} />

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
