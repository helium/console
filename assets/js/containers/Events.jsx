import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { fetchEvents, receivedEvent } from '../actions/event'

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

    return(
      <div>
        <h2>Events</h2>
        <ul>
          {events.map(event => <li key={event.id}>{event.description}</li>)}
        </ul>
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
