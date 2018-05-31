import gql from 'graphql-tag';

export const EventFragment = gql`
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
  subscription onEventAdded($contextId: String) {
    eventAdded(contextId: $contextId) {
      ...EventFragment
    }
  }
  ${EventFragment}
`
