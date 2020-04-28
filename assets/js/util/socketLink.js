import * as AbsintheSocket from '@absinthe/socket'
import { AbsintheSocketLink, createAbsintheSocketLink } from '@absinthe/socket-apollo-link'
import { ApolloLink, NextLink, Operation } from 'apollo-link'
import { Socket as PhoenixSocket } from 'phoenix'

import { store } from '../store/configureStore';

function getAuthToken() {
  return store.getState().auth.apikey
}

function createPhoenixSocket(token) {
  let organizationId;
  try {
    const organization = JSON.parse(localStorage.getItem('organization'));
    organizationId = organization ? organization.id : null;
  } catch (e) {
    organizationId = null;
  }
  return new PhoenixSocket(
    "/socket", 
    { params: { token, organization_id:  organizationId} }
  )
}

function createInnerSocketLink(phoenixSocket) {
  const absintheSocket = AbsintheSocket.create(phoenixSocket)
  return createAbsintheSocketLink(absintheSocket)
}

class SocketLink extends ApolloLink {
  constructor(methodForAuthToken) {
    super();
    this.socket = createPhoenixSocket(getAuthToken());
    this.link = createInnerSocketLink(this.socket);
    this._watchAuthToken();
    this.getAuthToken = methodForAuthToken;
    this.token = null;
  }

  request(operation, forward) {
    return this.link.request(operation, forward);
  }

  _watchAuthToken() {
    store.subscribe(async () => {
      const newTokenClaims = await this.getAuthToken();
      const newToken = newTokenClaims.__raw;
      if (newToken !== this.token) {
        this.token = newToken
        this.socket.disconnect()
        this.socket = createPhoenixSocket(this.token)
        this.link = createInnerSocketLink(this.socket)
      }
    })
  }
}

export default SocketLink;
