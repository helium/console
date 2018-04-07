import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button';

class DevicesTable extends Component {

  render() {
    const { devices, deleteDevice } = this.props

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
                  <Button color="primary">
                    View
                  </Button>

                  <Button color="secondary" onClick={() => deleteDevice(device)}>
                    Delete
                  </Button>

                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )
  }
}

export default DevicesTable
