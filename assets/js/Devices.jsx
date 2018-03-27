import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchDevices } from './actions/device'

class Devices extends Component {
  componentDidMount() {
    const { fetchDevices } = this.props
    fetchDevices()
  }

  render() {
    const { devices } = this.props

    return(
      <div>
        <h2>Devices</h2>
        <ul>
          {devices.map(device => <li key={device.id}>
            <Link to={`/devices/${device.id}`}>{device.name}</Link>
          </li>)}
        </ul>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    devices: state.device.index
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDevices }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Devices);
