import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { fetchEvents, receivedEvent } from '../actions/event'
import ReactTable from 'react-table'

class EventsTable extends Component {
  render() {
    const { events } = this.props

    const columns = [
      {
        Header: 'Type',
        accessor: 'description'
      },
      {
        Header: 'Size',
        accessor: 'payload_size',
        Cell: props => props.value ? <span>{props.value} bytes</span> : ''
      },
      {
        Header: 'RSSI',
        accessor: 'rssi'
      },
      {
        Header: 'Time',
        accessor: 'reported_at'
      },
      {
        Header: 'Response',
        accessor: 'status',
        Cell: props => props.value == "success" ? <span>OK</span> : <span>ERROR</span>
      }
    ]

    const tableContent = events.length > 0 ? (
      <ReactTable
        data={events}
        columns={columns}
        minRows={0}
        defaultPageSize={10}
        defaultSorted={[{id: "reported_at", desc: true}]}
      />
    ) : (
      <div>No Events</div>
    )

    return(
      <div>
        <h3>Event Log</h3>
        {tableContent}
      </div>
    )
  }
}

export default EventsTable
