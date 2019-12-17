import React, { Component } from 'react'
import { formatUnixDatetime, getDiffInSeconds } from '../../util/time'
import merge from 'lodash/merge'
import PaginatedTable, { PaginatedRow, PaginatedCell } from '../common/PaginatedTable'
import PacketGraph from '../common/PacketGraph'
import { EVENTS_SUBSCRIPTION } from '../../graphql/events'

// GraphQL
import { Subscription } from 'react-apollo';

// MUI
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

class EventsDashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: []
    }

    this.addEvent = this.addEvent.bind(this)
  }

  addEvent(event) {
    const { rows } = this.state
    const lastEvent = rows[rows.length - 1]
    if (rows.length > 100 && getDiffInSeconds(lastEvent.delivered_at) > 300) {
      truncated = rows.pop()
      this.setState({
        rows: [event].concat(truncated)
      })
    } else {
      this.setState({
        rows: [event].concat(rows)
      })
    }
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
        Header: 'SNR',
        accessor: 'snr',
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
          <React.Fragment>
            <Card style={{marginTop: 24}}>
              <CardContent>
                <Typography variant="headline" component="h3">
                  Real Time Packets
                </Typography>
                <div className="chart-legend left">
                  <div className="chart-legend-bulb red"></div>
                  <Typography component="p">
                    Live Data
                  </Typography>
                </div>
                <PacketGraph events={this.state.rows} />
              </CardContent>
            </Card>
            <Card style={{marginTop: 24}}>
              <CardContent>
                <Typography variant="headline" component="h3">
                  Event Log
                </Typography>
                <QueryResults
                  rows={this.state.rows}
                  columns={columns}
                />
              </CardContent>
            </Card>
          </React.Fragment>
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

export default EventsDashboard
