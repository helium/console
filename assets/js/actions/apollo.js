// GraphQL
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { store } from '../store/configureStore';
import { replace } from 'connected-react-router';
import createSocket from '../socket'

export const CREATED_APOLLO_CLIENT='CREATED_APOLLO_CLIENT';

export const setupApolloClient = (getAuthToken, currentOrganizationId) => {
  return async (dispatch) => {
    const tokenClaims = await getAuthToken();
    const token = tokenClaims.__raw

    const httpLink = new HttpLink({
      uri: "/graphql"
    })

    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
          organization: currentOrganizationId
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

    const link = authErrorLink.concat(authLink.concat(httpLink))

    const apolloClient = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    })

    let socket = createSocket(token, currentOrganizationId)
    socket.connect()

    return dispatch(createdApolloClient(apolloClient, socket));
  }
}

export const createdApolloClient = (apolloClient, socket) => {
  return {
    type: CREATED_APOLLO_CLIENT,
    apolloClient,
    socket
  };
}
