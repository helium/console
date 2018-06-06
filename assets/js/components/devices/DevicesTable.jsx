import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import random from 'lodash/random'
import sample from 'lodash/sample'
import userCan from '../../util/abilities'

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooterPagination from '../common/TableFooterPagination'
import Button from '@material-ui/core/Button';


const randomCity = () => (
  sample([
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
    "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
    "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
    "San Francisco, CA"
  ])
)

class DevicesTable extends Component {

  render() {
    const { devices, deleteDevice, totalEntries, page, pageSize } = this.props

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

export default DevicesTable
