import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { isJwtExpired } from '../util/jwt.js'

@connect(mapStateToProps, mapDispatchToProps)
class SocketHandler extends Component {
  constructor(props) {
    super(props)

    this.subscribeToUpdates = this.subscribeToUpdates.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.join = this.join.bind(this)
  }

  componentDidMount() {
    this.subscribeToUpdates()
  }

  componentDidUpdate(prevProps, prevState) {
    const { apikey } = this.props
    // if the user has switched teams or refreshed their api key...
    if (prevProps.apikey !== apikey) {
      this.disconnect()
      return this.subscribeToUpdates()
    }
  }

  componentWillUnmount() {
    this.disconnect()
  }

  subscribeToUpdates() {
    const { apikey } = this.props

    this.disconnect()

    this.socket = new Socket("/socket", {params: {token: apikey }})
    if (!isJwtExpired(apikey)) {
      this.socket.connect()
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
    apikey: state.auth.apikey
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default SocketHandler
