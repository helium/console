import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { fetchEvents, receivedEvent } from '../actions/event'
import ReactTable from 'react-table'

class Events extends Component {
  constructor(props) {
    super(props)
    console.log("fetchEvents props", props)

    this.subscribeToUpdates = this.subscribeToUpdates.bind(this)
  }

  componentDidMount() {
    console.log("events mounted")
    const { scope, id } = this.props
    console.log("fetchEvents id", id)

    this.subscribeToUpdates()

    const { fetchEvents } = this.props
    fetchEvents(scope, id)
  }

  subscribeToUpdates() {
    const { receivedEvent, apikey, scope, id } = this.props

    this.socket = new Socket("/socket", {params: {token: apikey}})
    this.socket.connect()

    const channelName = (scope == "all") ? "event:all" : `event:${scope}:${id}`
    let channel = this.socket.channel(channelName, {})
    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    channel.on("new", res => receivedEvent(res.data))
  }

  componentWillUnmount() {
    console.log("events will unmount")
    this.socket.disconnect()
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
        <h3>Event Log</h3>
        <p>id: {this.props.id}</p>
        {tableContent}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    events: state.event.current,
    apikey: state.auth.apikey
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEvents, receivedEvent }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Events);
