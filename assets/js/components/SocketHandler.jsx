import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { receivedEvent, deletedEvent } from '../actions/event'
import { receivedDevice, deletedDevice } from '../actions/device'
import { receivedGateway, deletedGateway } from '../actions/gateway'
import { receivedMembership, deletedMembership, updatedMembership } from '../actions/membership'
import { receivedInvitation, deletedInvitation, updatedInvitation } from '../actions/invitation'
import { isJwtExpired } from '../util/jwt.js'
import { fetchIndices } from '../actions/main'

@connect(mapStateToProps, mapDispatchToProps)
class SocketHandler extends Component {
  constructor(props) {
    super(props)

    this.subscribeToUpdates = this.subscribeToUpdates.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.join = this.join.bind(this)
  }

  componentDidMount() {
    if (this.props.isLoggedIn && this.props.currentTeamId) {
      this.props.fetchIndices()
      this.subscribeToUpdates()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isLoggedIn, currentTeamId, apikey, fetchIndices } = this.props

    // if the user has just logged in...
    if (!prevProps.isLoggedIn && isLoggedIn && currentTeamId) {
      this.subscribeToUpdates()
      return fetchIndices()
    }

    // if the user has just signed out...
    if (prevProps.isLoggedIn && !isLoggedIn) {
      return this.disconnect()
    }

    // if the user has switched teams or refreshed their api key...
    if (prevProps.apikey !== apikey) {
      this.disconnect()
      this.subscribeToUpdates()
      return fetchIndices()
    }
  }

  subscribeToUpdates() {
    const {
      receivedEvent,
      deletedEvent,
      receivedDevice,
      deletedDevice,
      receivedGateway,
      deletedGateway,
      receivedInvitation,
      deletedInvitation,
      updatedInvitation,
      receivedMembership,
      deletedMembership,
      updatedMembership,
      apikey,
      currentTeamId
    } = this.props

    this.disconnect()

    this.socket = new Socket("/socket", {params: {token: apikey }})
    if (!isJwtExpired(apikey) && currentTeamId) {
      this.socket.connect()

      this.join(`event:${currentTeamId}`, receivedEvent, deletedEvent)
      this.join(`device:${currentTeamId}`, receivedDevice, deletedDevice)
      this.join(`gateway:${currentTeamId}`, receivedGateway, deletedGateway)
      this.join(`membership:${currentTeamId}`, receivedMembership, deletedMembership, updatedMembership)
      this.join(`invitation:${currentTeamId}`, receivedInvitation, deletedInvitation, updatedInvitation)
    }
  }

  join(channelName, newHandler, deleteHandler, updateHandler) {
    let channel = this.socket.channel(channelName, {})

    channel.join()
      .receive("ok", resp => { console.log(`Joined ${channelName} successfully`, resp) })
      .receive("error", resp => { console.log(`Unable to join ${channelName}`, resp) })

    channel.on("new", res => newHandler(res))
    channel.on("delete", res => deleteHandler(res))

    if (updateHandler !== undefined) {
      channel.on("update", res => updateHandler(res))
    }
  }

  disconnect() {
    if (this.socket !== undefined) {
      console.log('disconnecting')
      this.socket.disconnect()
    }
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
    apikey: state.auth.apikey,
    currentTeamId: state.auth.currentTeamId
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchIndices,
    receivedEvent,
    deletedEvent,
    receivedDevice,
    deletedDevice,
    receivedGateway,
    deletedGateway,
    receivedMembership,
    deletedMembership,
    updatedMembership,
    receivedInvitation,
    deletedInvitation,
    updatedInvitation,
  }, dispatch);
}

export default SocketHandler
