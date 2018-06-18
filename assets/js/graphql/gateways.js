import gql from 'graphql-tag';

export const GATEWAY_FRAGMENT = gql`
  fragment GatewayFragment on Gateway {
    name,
    mac,
    id,
    location,
    latitude,
    longitude,
    status
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
