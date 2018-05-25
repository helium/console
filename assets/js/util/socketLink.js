import * as AbsintheSocket from '@absinthe/socket'
import { AbsintheSocketLink, createAbsintheSocketLink } from '@absinthe/socket-apollo-link'
import { ApolloLink, NextLink, Operation } from 'apollo-link'
import { Socket as PhoenixSocket } from 'phoenix'

import { store } from '../store/configureStore';

function getAuthToken() {
  return store.getState().auth.apikey
}

function createPhoenixSocket(token) {
  return new PhoenixSocket("/socket", { params: { token } })
}

function createInnerSocketLink(phoenixSocket) {
  const absintheSocket = AbsintheSocket.create(phoenixSocket)
  return createAbsintheSocketLink(absintheSocket)
}

class SocketLink extends ApolloLink {
  constructor() {
    super()
    this.socket = createPhoenixSocket(getAuthToken())
    this.link = createInnerSocketLink(this.socket)
    this._watchAuthToken()
  }

  request(operation, forward) {
    return this.link.request(operation, forward)
  }

  _watchAuthToken() {
    let token = getAuthToken()

    store.subscribe(() => {
      const newToken = getAuthToken()
      if (newToken !== token) {
        token = newToken
        this.socket.disconnect()
        this.socket = createPhoenixSocket(token)
        this.link = createInnerSocketLink(this.socket)
      }
    })
  }
}

export default new SocketLink()
