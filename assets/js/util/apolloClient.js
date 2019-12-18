// GraphQL
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error'
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { store } from '../store/configureStore';
import { replace } from 'connected-react-router';

import {ApolloLink} from "apollo-link";
import {hasSubscription} from "@jumpn/utils-graphql";
import socketLink from './socketLink'


const httpLink = createHttpLink({
  uri: "/graphql"
})

const authLink = setContext((_, { headers }) => {
  const token = store.getState().auth.apikey
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
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
        store.dispatch(replace("/channels"))
        break
      case "GatewayShowQuery":
        store.dispatch(replace("/gateways"))
        break
      default:
        break
    }
  }
})

const authHttpLink = authErrorLink.concat(authLink.concat(httpLink))

const link = new ApolloLink.split(
  operation => hasSubscription(operation.query),
  socketLink,
  authHttpLink
)

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

export default apolloClient
