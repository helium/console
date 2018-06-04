import React, { Component } from 'react'
import { formatDatetime } from '../../util/time'
import { EVENTS_SUBSCRIPTION, EVENT_FRAGMENT } from '../../graphql/events'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooterPagination from '../common/TableFooterPagination'

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
      page: 1,
      pageSize: 5
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data
    const { contextId, contextName } = this.props

    subscribeToMore({
      document: EVENTS_SUBSCRIPTION,
      variables: {contextId, contextName},
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
            entries: [newEvent, ...prev.events.entries.slice(0, this.state.pageSize - 1)],
          }
        })
      }
    })
  }

  handleChangeRowsPerPage(pageSize) {
    this.setState({ pageSize, page: 1 })
    const { fetchMore } = this.props.data

    fetchMore({
      variables: { page: 1, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  handleChangePage(page) {
    this.setState({ page })
    const { fetchMore } = this.props.data
    const { pageSize } = this.state

    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { loading, events } = this.props.data
    const { page, pageSize } = this.state

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
        <TableFooterPagination
          totalEntries={events.totalEntries}
          page={page}
          pageSize={pageSize}
          handleChangePage={this.handleChangePage}
          handleChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Table>
    )
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      contextId: props.contextId,
      contextName: props.contextName,
      page: 1,
      pageSize: 5
    }
  })
}

const query = gql`
  query PaginatedEventsQuery ($contextId: String, $contextName: String, $page: Int, $pageSize: Int) {
    events(contextId: $contextId, contextName: $contextName, page: $page, pageSize: $pageSize) {
      entries {
        ...EventFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${EVENT_FRAGMENT}
`

const EventsTableWithData = graphql(query, queryOptions)(EventsTablePaginated)

export default EventsTableWithData
