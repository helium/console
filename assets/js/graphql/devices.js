import gql from 'graphql-tag';

export const DEVICE_FRAGMENT = gql`
  fragment DeviceFragment on Device {
    name,
    mac,
    id
  }
`

export const DEVICE_SUBSCRIPTION = gql`
  subscription onDeviceAdded($teamId: String) {
    deviceAdded(teamId: $teamId) {
      ...DeviceFragment
    }
  }
  ${DEVICE_FRAGMENT}
`
