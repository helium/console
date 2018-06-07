import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import random from 'lodash/random'
import { parseLocation } from '../../util/geolocation'

import UserCan from '../common/UserCan'
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_GATEWAYS, GATEWAY_SUBSCRIPTION } from '../../graphql/gateways'
import BlankSlate from '../common/BlankSlate'

// redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteGateway } from '../../actions/gateway'

// MUI
import Button from '@material-ui/core/Button';

@connect(null, mapDispatchToProps)
class GatewaysTable extends Component {
  render() {
    const { deleteGateway } = this.props

    const columns = [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: props => <Link to={`/gateways/${props.row.id}`}>{props.value}</Link>
      },
      {
        Header: 'MAC',
        accessor: 'mac'
      },
      {
        Header: 'Location',
        accessor: 'location',
        Cell: props => <span>{parseLocation(props.value)}</span>
      },
      {
        Header: 'Earnings',
        accessor: 'mac',
        Cell: props => <span> {random(0, 100000).toLocaleString()} HLM </span>
      },
      {
        Header: 'Ask',
        accessor: 'mac',
        Cell: props => <span> {random(0.01, 5.0).toFixed(2)} HLM </span>
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
          <Button
            color="primary"
            component={Link}
            to={`/gateways/${props.row.id}`}
            size="small"
          >
            View
          </Button>

          <UserCan action="delete" itemType="gateway" item={props.row}>
            <Button
              color="secondary"
              onClick={() => deleteGateway(props.row.id)}
              size="small"
            >
              Delete
            </Button>
          </UserCan>
        </span>
      },
    ]

    return (
      <PaginatedTable
        columns={columns}
        query={PAGINATED_GATEWAYS}
        subscription={GATEWAY_SUBSCRIPTION}
        EmptyComponent={ props => <BlankSlate title="No gateways" subheading="To create a new gateway, click the red button in the corner" /> }
      />
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteGateway }, dispatch);
}

export default GatewaysTable
