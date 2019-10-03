import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
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
        Header: 'Created',
        accessor: 'inserted_at',
        Cell: props => <span>{moment(props.row.inserted_at).format('LL')}</span>
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
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
