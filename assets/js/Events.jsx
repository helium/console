import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Event from './Event'
import socket from './socket'

class Events extends Component {
  constructor(props) {
    super(props)

    this.state = {
      events: []
    }
  }

  componentDidMount() {
    let channel = socket.channel("event:all", {})
    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    channel.on("new", event => {
      const { events } = this.state
      this.setState({
        events: events.concat(event)
      })
    })

    // TODO fetch events
  }

  render() {
    const { events } = this.state

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

export default Events
