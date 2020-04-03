import gql from 'graphql-tag';

export const EVENT_FRAGMENT = gql`
  fragment EventFragment on Event {
    id,
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
    port,
    devaddr,
    hotspots {
      id,
      name,
      rssi,
      snr,
      frequency,
      spreading
    },
    channels {
      id,
      name,
      status,
      description
    }
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

export const DEVICE_EVENTS = gql`
  query DeviceEventsQuery ($device_id: String) {
    deviceEvents(device_id: $device_id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`
