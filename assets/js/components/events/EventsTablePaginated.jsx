import React, { Component } from 'react'
import { formatDatetime } from '../../util/time'

// MUI
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow, TableFooter } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton'

// Icons
import FirstIcon from 'material-ui-icons/FirstPage';
import PreviousIcon from 'material-ui-icons/KeyboardArrowLeft';
import NextIcon from 'material-ui-icons/KeyboardArrowRight';
import LastIcon from 'material-ui-icons/LastPage';

const EventStatus = (props) => {
  switch(props.status) {
    case "success":
      return <span>OK</span>
    case "error":
      return <span>ERROR</span>
    default:
      return <span>{props.status}</span>
  }
}

const EventPayloadSize = (props) => {
  if (!props.size) return <span />
  return <span>{props.size} bytes</span>
}

class EventsTablePaginated extends Component {
  render() {
    const { events, handleFirstPage, handleNextPage, handlePreviousPage, handleLastPage } = this.props
    const { pageInfo } = events

    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>RSSI</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.edges.map(edge => (
              <TableRow key={edge.node.id}>
                <TableCell>
                  {edge.node.description}
                </TableCell>
                <TableCell>
                  <EventPayloadSize size={edge.node.payload_size} />
                </TableCell>
                <TableCell>
                  {edge.node.rssi}
                </TableCell>
                <TableCell>
                  {formatDatetime(edge.node.reported_at)}
                </TableCell>
                <TableCell>
                  <EventStatus status={edge.node.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colspan="5" style={{textAlign: 'right'}}>
                <IconButton
                  disabled={!pageInfo.hasPreviousPage}
                  onClick={handleFirstPage}
                >
                  <FirstIcon />
                </IconButton>
                <IconButton
                  disabled={!pageInfo.hasPreviousPage}
                  onClick={handlePreviousPage}
                >
                  <PreviousIcon />
                </IconButton>
                <IconButton
                  disabled={!pageInfo.hasNextPage}
                  onClick={handleNextPage}
                >
                  <NextIcon />
                </IconButton>
                <IconButton
                  disabled={!pageInfo.hasNextPage}
                  onClick={handleLastPage}
                >
                  <LastIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    )
  }
}

export default EventsTablePaginated
