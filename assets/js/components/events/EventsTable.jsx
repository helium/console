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
  render() {
    const { contextId, contextName, fetchPolicy } = this.props

    const columns = [
      {
        Header: 'ID',
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
      <Subscription variables={{ contextId, contextName }} subscription={EVENTS_SUBSCRIPTION} onSubscriptionData={data => {console.log(data)}}>
        {({ data }) => (
          <QueryResults
            data={data}
            columns={columns}
          />
        )}
      </Subscription>
    )
  }
}

class QueryResults extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { data, columns } = this.props

    if (!data) {
      return (
        <Typography component="p">
          No events yet
        </Typography>
      )
    }

    return (
      <ResultsTable
        results={data.eventAdded}
        columns={columns}
      />
    )
  }
}

const ResultsTable = (props) => {
  const rows = [props.results]
  const { columns} = props

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
        {rows.map(row =>
          <PaginatedRow key={row.id} row={row} columns={columns} />
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
