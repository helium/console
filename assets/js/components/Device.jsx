import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchCurrentDevice } from '../actions/device'
import EventsTable from './EventsTable'

class Device extends Component {
  componentDidMount() {
    const { id } = this.props.match.params
    const { fetchCurrentDevice } = this.props
    fetchCurrentDevice(id)
  }

  render() {
    const { device, events } = this.props

    // if (device === null) return (<div>loading...</div>)

    return(
      <div>
        <h2>Device</h2>
        <p>ID: {device.id}</p>
        <p>Name: {device.name}</p>
        <p>MAC: {device.mac}</p>

        <EventsTable events={events} />
        <Link to="/devices">Devices</Link>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const device = state.entities.devices[ownProps.match.params.id]
  return {
    device,
    events: Object.values(pick(state.entities.events, device.events))
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchCurrentDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Device);
