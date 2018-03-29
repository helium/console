import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchDevices } from '../../actions/device'
import DashboardLayout from '../DashboardLayout'

class DeviceIndex extends Component {
  componentDidMount() {
    const { fetchDevices } = this.props
    fetchDevices()
  }

  render() {
    const { devices } = this.props

    return(
      <DashboardLayout title="Devices" current="devices">
        <ul>
          {Object.values(devices).map(device => <li key={device.id}>
            <Link to={`/devices/${device.id}`}>{device.name}</Link>
          </li>)}
        </ul>
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    devices: state.entities.devices
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDevices }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceIndex);
