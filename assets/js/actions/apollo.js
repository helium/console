// GraphQL
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { store } from '../store/configureStore';
import { replace } from 'connected-react-router';

import { hasSubscription } from "@jumpn/utils-graphql";
// import SocketLink from '../util/socketLink'

export const CREATED_APOLLO_CLIENT='CREATED_APOLLO_CLIENT';

export const setupApolloClient = (getAuthToken, currentOrganizationId) => {
  return async (dispatch) => {
    const httpLink = new HttpLink({
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
      if (networkError && networkError.statusCode == 404) {
        switch(operationName) {
          case "DeviceShowQuery":
            store.dispatch(replace("/devices"))
            break
          case "ChannelShowQuery":
            store.dispatch(replace("/integrations"))
            break
          case "LabelShowQuery":
            store.dispatch(replace("/labels"))
            break
          case "FunctionShowQuery":
            store.dispatch(replace("/functions"))
            break
          default:
            break
        }
      }
    })

    const authHttpLink = authErrorLink.concat(authLink.concat(httpLink))
    // const socketLink = new SocketLink(getAuthToken, currentOrganizationId);
    // const connectedSocket = await socketLink.connect();
    // connectedSocket.disconnect()

    // const link = new ApolloLink.split(
    //   operation => hasSubscription(operation.query),
    //   authHttpLink
    // )

    const apolloClient = new ApolloClient({
      link: authHttpLink,
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
