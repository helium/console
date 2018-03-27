import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchCurrentDevice } from './actions/device'
import Events from './Events'

class Device extends Component {
  componentDidMount() {
    console.log(this.props)
    const { id } = this.props.match.params
    const { fetchCurrentDevice } = this.props
    fetchCurrentDevice(id)
  }

  render() {
    const { device } = this.props

    if (device === null) return (<div>loading...</div>)

    return(
      <div>
        <h2>Device</h2>
        <p>ID: {device.id}</p>
        <p>Name: {device.name}</p>
        <p>MAC: {device.mac}</p>

        <Events scope="device" id={device.id} />
        <Link to="/devices">Devices</Link>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    device: state.device.current
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchCurrentDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Device);
