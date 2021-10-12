// GraphQL
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { store } from '../store/configureStore';
import { replace } from 'connected-react-router';
import { logOut } from '../actions/auth'
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
    const apolloClient = createApolloClient(link)

    let socket = createSocket(token, currentOrganizationId)
    socket.connect()

    store.subscribe(async () => {
      if (Math.ceil(Date.now() / 1000) > store.getState().apollo.tokenClaims.exp) {
        dispatch(logOut())
      }

      if (store.getState().apollo.tokenClaims.exp - Math.ceil(Date.now() / 1000) < 3600) {
        const newTokenClaims = await getAuthToken()
        const newAuthLink = setContext((_, { headers }) => {
          return {
            headers: {
              ...headers,
              authorization:`Bearer ${newTokenClaims.__raw}`,
              organization: currentOrganizationId
            }
          }
        })
        const newLink = authErrorLink.concat(newAuthLink.concat(httpLink))
        const newApolloClient = createApolloClient(newLink)
        socket.disconnect()
        socket = createSocket(newTokenClaims.__raw, currentOrganizationId)
        socket.connect()
        dispatch(createdApolloClient(newApolloClient, socket, newTokenClaims))
      }
    })

    return dispatch(createdApolloClient(apolloClient, socket, tokenClaims));
  }
}

const createApolloClient = (link) => (
  new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            organization: {
              merge: false
            },
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
            allMultiBuys: {
              merge: false
            },
            alertsForNode: {
              merge: false
            },
            allAlerts: {
              merge: false
            }
          },
        },
        Label: {
          fields: {
            devices: {
              merge: false
            },
            alerts: {
              merge: false
            }
          }
        },
        Device: {
          fields: {
            labels: {
              merge: false
            },
            alerts: {
              merge: false
            }
          }
        },
        Function: {
          fields: {
            labels: {
              merge: false
            }
          }
        },
        Channel: {
          fields: {
            labels: {
              merge: false
            }
          }
        }
      },
    }),
  })
)

export const createdApolloClient = (apolloClient, socket, tokenClaims) => {
  return {
    type: CREATED_APOLLO_CLIENT,
    apolloClient,
    socket,
    tokenClaims
  };
}
