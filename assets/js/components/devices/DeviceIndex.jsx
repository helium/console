import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchDevices, deleteDevice } from '../../actions/device'
import RandomDeviceButton from './RandomDeviceButton'
import Button from 'material-ui/Button'
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import DevicesTable from './DevicesTable'

class DeviceIndex extends Component {
  componentDidMount() {
    const { fetchDevices } = this.props
    fetchDevices()
  }

  render() {
    const { devices, deleteDevice } = this.props

    return(
      <div>
        <Paper>
          <DevicesTable devices={devices} deleteDevice={deleteDevice} />
        </Paper>

        <RandomDeviceButton />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    devices: Object.values(state.entities.devices)
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDevices, deleteDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceIndex);
