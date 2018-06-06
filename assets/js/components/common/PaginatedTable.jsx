import React, { Component } from 'react'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooterPagination from './TableFooterPagination'
import Button from '@material-ui/core/Button';

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    }
  })
}

class PaginatedTable extends Component {


  render() {
    return(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>MAC</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell>Bid</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.map(device => {
            return (
              <TableRow key={device.id}>
                <TableCell>
                  <Link to={`/devices/${device.id}`}>{device.name}</Link>
                </TableCell>

                <TableCell>
                  {device.mac}
                </TableCell>

                <TableCell>
                  {randomCity()}
                </TableCell>

                <TableCell>
                  {random(0, 1000).toLocaleString()} HLM
                </TableCell>

                <TableCell>
                  {random(0.01, 5.0).toFixed(2)} HLM
                </TableCell>

                <TableCell numeric>
                  <Button
                    color="primary"
                    component={Link}
                    to={`/devices/${device.id}`}
                    size="small"
                  >
                    View
                  </Button>

                  {userCan('delete', 'device', device) &&
                    <Button
                      color="secondary"
                      onClick={() => deleteDevice(device)}
                      size="small"
                    >
                      Delete
                    </Button>
                  }
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooterPagination
          totalEntries={totalEntries}
          page={page}
          pageSize={pageSize}
          handleChangePage={this.props.handleChangePage}
          handleChangeRowsPerPage={this.props.handleChangeRowsPerPage}
        />
      </Table>
    )
  }
}

export default PaginatedTable
