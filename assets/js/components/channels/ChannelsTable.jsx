import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button';

class ChannelsTable extends Component {

  render() {
    const { channels, deleteChannel } = this.props

    return(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {channels.map(channel => {
            return (
              <TableRow key={channel.id}>
                <TableCell>
                  <Link to={`/channels/${channel.id}`}>{channel.name}</Link>
                </TableCell>
                <TableCell>{channel.type}</TableCell>
                <TableCell>
                  <Button color="primary" component={Link} to={`/channels/${channel.id}`}>
                    View
                  </Button>

                  <Button color="secondary" onClick={() => deleteChannel(channel)}>
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

export default ChannelsTable
