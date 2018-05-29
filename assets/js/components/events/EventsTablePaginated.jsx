import React, { Component } from 'react'
import { formatDatetime } from '../../util/time'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

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
  constructor(props) {
    super(props)

    this.state = {
      page: 1
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: EVENTS_SUBSCRIPTION,
      variables: {deviceId: this.props.deviceId},
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev

        if (this.state.page !== 1) return Object.assign({}, prev, {
          events: {
            ...prev.events,
            totalEntries: prev.events.totalEntries + 1,
          }
        })

        const newEvent = subscriptionData.data.eventAdded

        return Object.assign({}, prev, {
          events: {
            ...prev.events,
            totalEntries: prev.events.totalEntries + 1,
            entries: [newEvent, ...prev.events.entries.slice(0, 4)],
          }
        })
      }
    })
  }

  handleChangeRowsPerPage(pageSize) {
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  handleChangePage(page) {
    this.setState({ page })
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { loading, events } = this.props.data
    const { page } = this.state

    if (loading) return <div />

    return (
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
          {events.entries.map(event => (
            <TableRow key={event.id}>
              <TableCell>
                {event.description}
              </TableCell>
              <TableCell>
                <EventPayloadSize size={event.payload_size} />
              </TableCell>
              <TableCell>
                {event.rssi}
              </TableCell>
              <TableCell>
                {formatDatetime(event.reported_at)}
              </TableCell>
              <TableCell>
                <EventStatus status={event.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={events.totalEntries}
              onChangePage={(e, page) => this.handleChangePage(page + 1)}
              onChangeRowsPerPage={(e) => this.handleChangeRowsPerPage(e.target.value)}
              page={page - 1}
              rowsPerPage={events.pageSize}
            />
          </TableRow>
        </TableFooter>
      </Table>
    )
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      deviceId: props.deviceId,
      page: 1,
      pageSize: 5
    }
  })
}

const query = gql`
  query PaginatedEventsQuery ($deviceId: String, $page: Int, $pageSize: Int) {
    events(deviceId: $deviceId, page: $page, pageSize: $pageSize) {
      entries {
        id,
        description,
        rssi,
        payload_size,
        reported_at,
        status
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`

// TODO create event fragment?
const EVENTS_SUBSCRIPTION = gql`
  subscription onEventAdded($deviceId: String) {
    eventAdded(deviceId: $deviceId) {
      id,
      description,
      rssi,
      payload_size,
      reported_at,
      status
    }
  }
`

const EventsTableWithData = graphql(query, queryOptions)(EventsTablePaginated)

export default EventsTableWithData
