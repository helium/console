import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchGateway } from '../../actions/gateway'
import EventsTable from '../../EventsTable'

class GatewayShow extends Component {
  componentDidMount() {
    const { id } = this.props.match.params
    this.props.fetchGateway(id)
  }

  render() {
    const { gateway, events } = this.props

    if (gateway === undefined) return (<div>loading...</div>)

    return(
      <div>
        <h2>Gateway</h2>
        <p>ID: {gateway.id}</p>
        <p>Name: {gateway.name}</p>
        <p>MAC: {gateway.mac}</p>
        <p>Lat: {gateway.latitude}</p>
        <p>Lng: {gateway.longitude}</p>

        <EventsTable events={events} />
        <Link to="/gateways">Gateways</Link>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const gateway = state.entities.gateways[ownProps.match.params.id]
  if (gateway === undefined) return {}
  return {
    gateway,
    events: Object.values(pick(state.entities.events, gateway.events))
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchGateway }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(GatewayShow);
