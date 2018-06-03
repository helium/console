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

class ChannelsTable extends Component {

  render() {
    const { channels, deleteChannel, totalEntries, page, pageSize } = this.props

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
                <TableCell>{channel.type_name}</TableCell>
                <TableCell>
                  <Button color="primary" component={Link} to={`/channels/${channel.id}`}>
                    View
                  </Button>

                  {userCan('delete', 'channel', channel) &&
                    <Button color="secondary" onClick={() => deleteChannel(channel)}>
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

export default ChannelsTable
