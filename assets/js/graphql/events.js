import { gql } from '@apollo/client';

export const EVENT_FRAGMENT = gql`
  fragment EventFragment on Event {
    id,
    description,
    data,
    device_name,
    category,
    frame_up,
    frame_down,
    reported_at,
    sub_category,
    router_uuid
  }
`

export const DEVICE_EVENTS = gql`
  query DeviceEventsQuery ($device_id: ID!) {
    deviceEvents(device_id: $device_id) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`
