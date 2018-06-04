import gql from 'graphql-tag';

export const GATEWAY_FRAGMENT = gql`
  fragment GatewayFragment on Gateway {
    name,
    mac,
    id,
    latitude,
    longitude
  }
`

export const GATEWAY_SUBSCRIPTION = gql`
  subscription onGatewayAdded {
    gatewayAdded {
      ...GatewayFragment
    }
  }
  ${GATEWAY_FRAGMENT}
`
