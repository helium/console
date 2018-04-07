import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import { fetchGateways, deleteGateway } from '../../actions/gateway'
import DashboardLayout from '../common/DashboardLayout'
import RandomGatewayButton from './RandomGatewayButton'
import GatewaysTable from './GatewaysTable'

class GatewayIndex extends Component {
  componentDidMount() {
    this.props.fetchGateways()
  }

  render() {
    const { gateways, deleteGateway } = this.props

    return(
      <DashboardLayout title="Gateways" current="gateways">
        <Paper>
          <GatewaysTable gateways={gateways} deleteGateway={deleteGateway} />
        </Paper>
        <RandomGatewayButton />
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
  return bindActionCreators({ fetchGateways, deleteGateway }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(GatewayIndex);
