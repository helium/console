// GraphQL
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { store } from '../store/configureStore';
import { replace } from 'connected-react-router';
import createSocket from '../socket'

export const CREATED_APOLLO_CLIENT='CREATED_APOLLO_CLIENT';

export const setupApolloClient = (getAuthToken, organizationId) => {
  return async (dispatch) => {
    let currentOrganizationId = organizationId
    let tokenClaims = await getAuthToken();
    let token = tokenClaims.__raw

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
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              allOrganizations: {
                merge: false
              },
              allLabels:{
                merge: false
              },
              apiKeys: {
                merge: false
              },
              allChannels: {
                merge: false
              },
              allFunctions: {
                merge: false
              },
              device_imports: {
                merge: false
              },
              allDevices: {
                merge: false
              },
              organization: {
                merge: false
              },
              alertsForNode: {
                merge: false
              }
            },
          },
          Label: {
            fields: {
              devices: {
                merge: false
              }
            }
          },
          Device: {
            fields: {
              labels: {
                merge: false
              }
            }
          }
        },
      }),
    })

    let socket = createSocket(token, currentOrganizationId)
    socket.connect()

    store.subscribe(async () => {
      const newTokenClaims = await getAuthToken();
      const newToken = newTokenClaims.__raw;
      const newOrganization = store.getState().organization;

      if (newToken !== token || currentOrganizationId !== newOrganization.currentOrganizationId) {
        currentOrganizationId = newOrganizationId
        token = newToken;
        socket.disconnect();
        socket = createSocket(token, currentOrganizationId)
        socket.connect()
      }
    })

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
