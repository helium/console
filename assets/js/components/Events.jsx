import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { fetchEvents, receivedEvent } from '../actions/event'
import ReactTable from 'react-table'

class Events extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { fetchEvents, receivedEvent, apikey } = this.props

    let socket = new Socket("/socket", {params: {token: apikey}})
    socket.connect()

    let channel = socket.channel("event:all", {})
    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    channel.on("new", res => receivedEvent(res.data))

    fetchEvents()
  }

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
        <h2>Events</h2>
        {tableContent}
        <Link to="/secret">Secret</Link>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.event.events,
    apikey: state.auth.apikey
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEvents, receivedEvent }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Events);
