import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button';

class PaginatedTable extends Component {

  render() {
    const { devices } = this.props

    return(
      <div>
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

                    <Button color="secondary">
                      Delete
                    </Button>

                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    )
  }
}

export default PaginatedTable
