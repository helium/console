import gql from 'graphql-tag';

export const EVENT_FRAGMENT = gql`
  fragment EventFragment on Event {
    hotspot_name,
    channel_name,
    status,
    description,
    payload,
    payload_size,
    rssi,
    snr,
    category,
    frame_up,
    frame_down,
    reported_at,
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
