import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import userCan from '../../util/abilities'

class GatewaysTable extends Component {

  render() {
    const { gateways, deleteGateway } = this.props

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
          {gateways.map(gateway => {
            return (
              <TableRow key={gateway.id}>
                <TableCell>
                  <Link to={`/gateways/${gateway.id}`}>{gateway.name}</Link>
                </TableCell>
                <TableCell>{gateway.mac}</TableCell>
                <TableCell>
                  <Button color="primary" component={Link} to={`/gateways/${gateway.id}`}>
                    View
                  </Button>

                  {userCan('delete', 'gateway', gateway) &&
                    <Button color="secondary" onClick={() => deleteGateway(gateway)}>
                      Delete
                    </Button>
                  }

                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )
  }
}

export default GatewaysTable
