import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import { fetchGateways, deleteGateway } from '../../actions/gateway'
import RandomGatewayButton from './RandomGatewayButton'
import GatewaysTable from './GatewaysTable'

class GatewayIndex extends Component {
  componentDidMount() {
    this.props.fetchGateways()
  }

  render() {
    const { gateways, deleteGateway } = this.props

    return(
      <div>
        <Paper>
          <GatewaysTable gateways={gateways} deleteGateway={deleteGateway} />
        </Paper>
        <RandomGatewayButton />
      </div>
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
