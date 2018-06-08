import gql from 'graphql-tag';

export const EVENT_FRAGMENT = gql`
  fragment EventFragment on Event {
    id,
    description,
    rssi,
    payload_size,
    reported_at,
    status,
    direction
  }
`
export const EVENTS_SUBSCRIPTION = gql`
  subscription onEventAdded($contextId: String, $contextName: String) {
    eventAdded(contextId: $contextId, contextName: $contextName) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`

export const PAGINATED_EVENTS = gql`
  query PaginatedEventsQuery ($contextId: String, $contextName: String, $page: Int, $pageSize: Int) {
    events(contextId: $contextId, contextName: $contextName, page: $page, pageSize: $pageSize) {
      entries {
        ...EventFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${EVENT_FRAGMENT}
`
