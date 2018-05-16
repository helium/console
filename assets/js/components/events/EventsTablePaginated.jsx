import React, { Component } from 'react'
import { formatDatetime } from '../../util/time'

import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button'

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
    const { events, handleNextPage, handlePreviousPage } = this.props
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
        </Table>
        <div>
          <Button
            disabled={!pageInfo.hasPreviousPage}
            onClick={handlePreviousPage}
          >
            Previous
          </Button>
          <Button
            disabled={!pageInfo.hasNextPage}
            onClick={handleNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }
}

export default EventsTablePaginated
