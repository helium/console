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
  subscription onGatewayAdded($teamId: String) {
    gatewayAdded(teamId: $teamId) {
      ...GatewayFragment
    }
  }
  ${GATEWAY_FRAGMENT}
`
