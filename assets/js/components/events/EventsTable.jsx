import React, { Component } from 'react'
import { formatDatetime } from '../../util/time'
import PaginatedTable from '../common/PaginatedTable'
import { EVENTS_SUBSCRIPTION, PAGINATED_EVENTS } from '../../graphql/events'

// MUI

class EventsTable extends Component {
  render() {
    const { contextId, contextName } = this.props

    const columns = [
      {
        Header: 'Type',
        accessor: 'description',
      },
      {
        Header: 'size',
        accessor: 'payload_size',
        Cell: props => <EventPayloadSize size={props.value} />
      },
      {
        Header: 'RSSI',
        accessor: 'rssi',
      },
      {
        Header: 'Time',
        accessor: 'reported_at',
        Cell: props => <span> {formatDatetime(props.value)} </span>
      },
      {
        Header: 'Cost',
        accessor: 'dc',
        Cell: props => <EventStatus status={props.value} />
      },
    ]

    return (
      <PaginatedTable
        columns={columns}
        query={PAGINATED_EVENTS}
        subscription={EVENTS_SUBSCRIPTION}
        variables={{ pageSize: 5, contextId, contextName }}
        subscriptionVariables={{ contextId, contextName }}
      />
    )
  }
}

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

export default EventsTable
