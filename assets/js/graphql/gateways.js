import gql from 'graphql-tag';

export const GATEWAY_FRAGMENT = gql`
  fragment GatewayFragment on Gateway {
    name,
    mac,
    id,
    location,
    latitude,
    longitude,
    status,
    public_key
  }
`

export const GATEWAY_ADDED_SUBSCRIPTION = gql`
  subscription onGatewayAdded {
    gatewayAdded {
      ...GatewayFragment
    }
  }
  ${GATEWAY_FRAGMENT}
`

export const GATEWAY_UPDATED_SUBSCRIPTION = gql`
  subscription onGatewayUpdated ($id: ID!) {
    gatewayUpdated(id: $id) {
      ...GatewayFragment
    }
  }
  ${GATEWAY_FRAGMENT}
`

export const PAGINATED_GATEWAYS = gql`
  query PaginatedGatewaysQuery ($page: Int, $pageSize: Int) {
    gateways(page: $page, pageSize: $pageSize) {
      entries {
        ...GatewayFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${GATEWAY_FRAGMENT}
`

export const GATEWAY_SHOW_QUERY = gql`
  query GatewayShowQuery ($id: ID!) {
    gateway(id: $id) {
      ...GatewayFragment
    }
  }
  ${GATEWAY_FRAGMENT}
`
