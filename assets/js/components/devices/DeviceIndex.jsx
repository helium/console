import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchDevices, deleteDevice } from '../../actions/device'
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
  componentDidMount() {
    const { fetchDevices } = this.props
    fetchDevices()
  }

  render() {
    const { devices, deleteDevice } = this.props

    return(
      <DashboardLayout title={"All Devices"}>
        <Paper>
        </Paper>
        <Paper>
          {devices.length === 0 ? (
            <BlankSlate
              title="No devices"
              subheading="To create a new device, click the red button in the corner"
            />
          ) : (
            <DevicesTable devices={devices} deleteDevice={deleteDevice} />
          ) }
        </Paper>

        {userCan('create', 'device') &&
          <RandomDeviceButton />
        }
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    devices: Object.values(state.entities.devices),
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDevices, deleteDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceIndex);
