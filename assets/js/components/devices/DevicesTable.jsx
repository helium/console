import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import userCan from '../../util/abilities'
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_DEVICES } from '../../graphql/devices'

// MUI
import Button from '@material-ui/core/Button';


class DevicesTable extends Component {

  render() {
    const columns = [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: props => <Link to={`/devices/${props.row.id}`}>{device.name}</Link>
      },
      {
        Header: 'MAC',
        accessor: 'mac'
      },
    ]

    return (
      <PaginatedTable query={PAGINATED_DEVICES} columns={columns} />
    )
  }
}

export default DevicesTable
