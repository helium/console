import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import UserCan from '../common/UserCan'
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_DEVICES, DEVICE_SUBSCRIPTION } from '../../graphql/devices'
import BlankSlate from '../common/BlankSlate'

// redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteDevice } from '../../actions/device'

// MUI
import Button from '@material-ui/core/Button';

import random from 'lodash/random'
import sample from 'lodash/sample'
const randomCity = () => (
  sample([
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
    "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
    "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
    "San Francisco, CA"
  ])
)


@connect(null, mapDispatchToProps)
class DevicesTable extends Component {

  render() {
    const { deleteDevice } = this.props

    const columns = [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: props => <Link to={`/devices/${props.row.id}`}>{props.value}</Link>
      },
      {
        Header: 'MAC',
        accessor: 'mac'
      },
      {
        Header: 'Location',
        accessor: 'mac',
        Cell: props => <span>{randomCity()}</span>
      },
      {
        Header: 'Cost',
        accessor: 'mac',
        Cell: props => <span> {random(0, 1000).toLocaleString()} HLM </span>
      },
      {
        Header: 'Bid',
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
            to={`/devices/${props.row.id}`}
            size="small"
          >
            View
          </Button>

          <UserCan action="delete" itemType="device" item={props.row}>
            <Button
              color="secondary"
              onClick={() => deleteDevice(props.row.id)}
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
        query={PAGINATED_DEVICES}
        subscription={DEVICE_SUBSCRIPTION}
        EmptyComponent={ props => <BlankSlate title="No devices" subheading="To create a new device, click the red button in the corner" /> }
      />
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteDevice }, dispatch);
}

export default DevicesTable
