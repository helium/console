// GraphQL
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error'
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { store } from '../store/configureStore';
import { replace } from 'connected-react-router';

import { ApolloLink } from "apollo-link";
import { hasSubscription } from "@jumpn/utils-graphql";
import SocketLink from '../util/socketLink'

export const CREATED_APOLLO_CLIENT='CREATED_APOLLO_CLIENT';

export const setupApolloClient = (getAuthToken, currentOrganizationId) => {
  return async (dispatch) => {
    const httpLink = createHttpLink({
      uri: "/graphql"
    })

    const authLink = setContext(async (_, { headers }) => {
      const tokenClaims = await getAuthToken();
      const token = tokenClaims.__raw
      let assignableHeaders = {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        }
      }
      const organizationId = JSON.parse(localStorage.getItem('organization')).id;
      if (organizationId) {
        Object.assign(assignableHeaders, {organization: organizationId })
      }
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
          organization: organizationId
        }
      }
    })

    const authErrorLink = onError(({ networkError, operation: { operationName }}) => {
      if (networkError.statusCode == 404) {
        switch(operationName) {
          case "DeviceShowQuery":
            store.dispatch(replace("/devices"))
            break
          case "ChannelShowQuery":
            store.dispatch(replace("/integrations"))
            break
          default:
            break
        }
      }
    })

    const authHttpLink = authErrorLink.concat(authLink.concat(httpLink))
    const socketLink = new SocketLink(getAuthToken, currentOrganizationId);
    await socketLink.connect();

    const link = new ApolloLink.split(
      operation => hasSubscription(operation.query),
      socketLink,
      authHttpLink
    )

    const apolloClient = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    })
    return dispatch(createdApolloClient(apolloClient));
  }
}

export const createdApolloClient = (apolloClient) => {
  return {
    type: CREATED_APOLLO_CLIENT,
    apolloClient
  };
}
