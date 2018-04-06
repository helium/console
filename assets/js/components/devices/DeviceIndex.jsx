import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchDevices } from '../../actions/device'
import DashboardLayout from '../common/DashboardLayout'
import RandomDeviceButton from './RandomDeviceButton'
import Button from 'material-ui/Button'

class DeviceIndex extends Component {
  componentDidMount() {
    const { fetchDevices } = this.props
    fetchDevices()
  }

  render() {
    const { devices } = this.props

    return(
      <DashboardLayout title="Devices" current="devices">
        {devices.length > 0 ? (
          <ul>
            {devices.map(device => <li key={device.id}>
              <Link to={`/devices/${device.id}`}>{device.name}</Link>
            </li>)}
          </ul>
        ) : (
          <p>No devices</p>
        )}
        <RandomDeviceButton />
        <Button variant="raised" color="primary">
          Hello World
        </Button>
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    devices: Object.values(state.entities.devices)
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDevices }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceIndex);
