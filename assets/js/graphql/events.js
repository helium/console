import gql from 'graphql-tag';

export const EVENT_FRAGMENT = gql`
  fragment EventFragment on Event {
    id,
    description,
    payload_size,
    payload,
    device_name,
    category,
    frame_up,
    frame_down,
    reported_at,
    port,
    devaddr,
    hotspots,
    channels
  }
`
export const EVENTS_SUBSCRIPTION = gql`
  subscription onEventAdded($device_id: String) {
    eventAdded(device_id: $device_id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`

export const DEVICE_DEBUG_EVENTS_SUBSCRIPTION = gql`
  subscription deviceDebugEventAdded($device_id: String) {
    deviceDebugEventAdded(device_id: $device_id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`

export const LABEL_DEBUG_EVENTS_SUBSCRIPTION = gql`
  subscription labelDebugEventAdded($label_id: String) {
    labelDebugEventAdded(label_id: $label_id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`

export const DEVICE_EVENTS = gql`
  query DeviceEventsQuery ($device_id: ID!) {
    deviceEvents(device_id: $device_id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`
