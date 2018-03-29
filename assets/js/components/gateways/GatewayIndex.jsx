import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchGateways } from '../../actions/gateway'
import DashboardLayout from '../DashboardLayout'

class GatewayIndex extends Component {
  componentDidMount() {
    this.props.fetchGateways()
  }

  render() {
    const { gateways } = this.props

    return(
      <DashboardLayout title="Gateways" current="gateways">
        {gateways.length > 0 ? (
          <ul>
            {gateways.map(gateway => <li key={gateway.id}>
              <Link to={`/gateways/${gateway.id}`}>{gateway.name}</Link>
            </li>)}
          </ul>
        ) : (
          <p>No gateways</p>
        )}
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    gateways: Object.values(state.entities.gateways)
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchGateways }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(GatewayIndex);
