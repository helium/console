import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { receivedEvent } from '../actions/event'
import { fetchIndices } from '../actions/main'

class SocketHandler extends Component {
  constructor(props) {
    super(props)

    this.subscribeToUpdates = this.subscribeToUpdates.bind(this)
    this.disconnect = this.disconnect.bind(this)
  }

  componentDidMount() {
    if (this.props.isLoggedIn) {
      this.props.fetchIndices()
      this.subscribeToUpdates()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // if the user has just logged in...
    if (!prevProps.isLoggedIn && this.props.isLoggedIn) {
      this.subscribeToUpdates()
      this.props.fetchIndices()
    }

    // if the user has just signed out...
    if (prevProps.isLoggedIn && !this.props.isLoggedIn) {
      this.disconnect()
    }
  }

  subscribeToUpdates() {
    const { receivedEvent, apikey } = this.props

    if (this.socket !== undefined) { this.disconnect() }

    this.socket = new Socket("/socket", {params: {token: apikey}})
    this.socket.connect()

    let channel = this.socket.channel("event:all", {})
    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    channel.on("new", res => receivedEvent(res))
  }

  disconnect() {
    console.log('disconnecting')
    this.socket.disconnect()
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    apikey: state.auth.apikey
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchIndices, receivedEvent }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SocketHandler);

