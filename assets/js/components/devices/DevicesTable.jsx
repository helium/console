import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Button from '@material-ui/core/Button';
import userCan from '../../util/abilities'

class DevicesTable extends Component {

  render() {
    const { devices, deleteDevice, totalEntries, page, pageSize } = this.props

    return(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>MAC</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.map(device => {
            return (
              <TableRow key={device.id}>
                <TableCell>
                  <Link to={`/devices/${device.id}`}>{device.name}</Link>
                </TableCell>
                <TableCell>{device.mac}</TableCell>
                <TableCell>
                  <Button color="primary" component={Link} to={`/devices/${device.id}`}>
                    View
                  </Button>

                  {userCan('delete', 'device', device) &&
                    <Button color="secondary" onClick={() => deleteDevice(device)}>
                      Delete
                    </Button>
                  }

                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={totalEntries}
              onChangePage={(e, page) => this.props.handleChangePage(page + 1)}
              onChangeRowsPerPage={(e) => this.props.handleChangeRowsPerPage(e.target.value)}
              page={page - 1}
              rowsPerPage={pageSize}
            />
          </TableRow>
        </TableFooter>
      </Table>
    )
  }
}

export default DevicesTable
