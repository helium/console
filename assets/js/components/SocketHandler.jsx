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
  }

  componentWillMount() {
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
      console.log('connecting')
      // join goes here
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
        {React.cloneElement(this.props.children, { socket: this.socket, currentTeamId: this.props.currentTeamId })}
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    apikey: state.auth.apikey,
    currentTeamId: state.auth.currentTeamId
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default SocketHandler
