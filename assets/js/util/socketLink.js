import * as AbsintheSocket from '@absinthe/socket'
import { AbsintheSocketLink, createAbsintheSocketLink } from '@absinthe/socket-apollo-link'
import { ApolloLink, NextLink, Operation } from 'apollo-link'
import { Socket as PhoenixSocket } from 'phoenix'

import { store } from '../store/configureStore';

function createPhoenixSocket(token, organizationId) {
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
  constructor(methodForAuthToken, organizationId) {
    super();
    this.getAuthToken = methodForAuthToken;
    this.token = null;
    this.organizationId = organizationId;
  }

  async connect() {
    const newTokenClaims = await this.getAuthToken();
    const newToken = newTokenClaims.__raw;
    if (this.token !== newToken) {
      this.token = newToken;
    }
    this.socket = createPhoenixSocket(this.token, this.organizationId);
    this.link = createInnerSocketLink(this.socket);
    this._watchAuthToken();
    return this.socket
  }

  request(operation, forward) {
    return this.link.request(operation, forward);
  }

  _watchAuthToken() {
    store.subscribe(async () => {
      const newTokenClaims = await this.getAuthToken();
      const newToken = newTokenClaims.__raw;
      const { currentOrganizationId } = store.getState().organization;
      if (newToken !== this.token || this.organizationId !== currentOrganizationId) {
        this.organizationId = currentOrganizationId;
        this.token = newToken;
        this.socket.disconnect();
        this.socket = createPhoenixSocket(this.token, this.organizationId);
        this.link = createInnerSocketLink(this.socket);
      }
    })
  }
}

export default SocketLink;
