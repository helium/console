import React, { Component } from 'react'
import { formatUnixDatetime } from '../../util/time'
import merge from 'lodash/merge'
import PaginatedTable, { PaginatedRow, PaginatedCell } from '../common/PaginatedTable'
import { EVENTS_SUBSCRIPTION } from '../../graphql/events'

// GraphQL
import { Subscription } from 'react-apollo';

// MUI
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

class EventsTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: []
    }
  }

  addEvent(event) {
    this.setState({
      rows: [event].concat(this.state.rows)
    })
  }

  render() {
    const { contextId, contextName, fetchPolicy } = this.props

    const columns = [
      {
        Header: 'Device ID',
        accessor: 'id',
      },
      {
        Header: 'Hotspot Name',
        accessor: 'hotspot_name',
      },
      {
        Header: 'Channel',
        accessor: 'channel_name',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Size',
        accessor: 'payload_size',
        Cell: props => <EventPayloadSize size={props.value} />
      },
      {
        Header: 'RSSI',
        accessor: 'rssi',
      },
      {
        Header: 'Reported At',
        accessor: 'reported_at',
        Cell: props => <span> {formatUnixDatetime(props.value)} </span>
      },
      {
        Header: 'Delivered At',
        accessor: 'delivered_at',
        Cell: props => <span> {formatUnixDatetime(props.value)} </span>
      },
    ]

    return(
      <Subscription
        variables={{ contextId, contextName }}
        subscription={EVENTS_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => { this.addEvent(subscriptionData.data.eventAdded) }}
      >
        {({ data }) => (
          <QueryResults
            rows={this.state.rows}
            columns={columns}
          />
        )}
      </Subscription>
    )
  }
}

class QueryResults extends Component {
  render() {
    const { rows, columns } = this.props

    if (rows.length === 0) {
      return (
        <Typography component="p">
          No events yet
        </Typography>
      )
    }

    return (
      <ResultsTable
        rows={rows}
        columns={columns}
      />
    )
  }
}

const ResultsTable = (props) => {
  const { columns, rows } = props

  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column, i) =>
            <TableCell
              key={`header-${i}`}
              numeric={column.numeric}
              padding={column.padding}
            >
              {column.Header}
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) =>
          <PaginatedRow key={index} row={row} columns={columns} />
        )}
      </TableBody>
    </Table>
  )
}

const EventPayloadSize = (props) => {
  if (!props.size) return <span />
  return <span>{props.size} bytes</span>
}

export default EventsTable
