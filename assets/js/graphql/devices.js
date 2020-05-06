import gql from 'graphql-tag';

export const DEVICE_FRAGMENT = gql`
  fragment DeviceFragment on Device {
    id,
    name,
    dev_eui,
    app_eui,
    app_key,
    frame_up,
    frame_down,
    last_connected,
    inserted_at,
    total_packets,
  }
`

export const DEVICE_SUBSCRIPTION = gql`
  subscription onDeviceAdded {
    deviceAdded {
      ...DeviceFragment
    }
  }
  ${DEVICE_FRAGMENT}
`

export const DEVICE_UPDATE_SUBSCRIPTION = gql`
  subscription onDeviceUpdated($deviceId: String) {
    deviceUpdated(deviceId: $deviceId) {
      name
    }
  }
`

export const DEVICE_SHOW = gql`
  query DeviceShowQuery ($id: ID!) {
    device(id: $id) {
      ...DeviceFragment
      labels {
        name,
        id,
        color,
        channels {
          name,
          id,
        },
        function {
          id,
          name
        }
      }
      total_packets,
      packets_last_1d,
      packets_last_7d,
      packets_last_30d
    }
  }
  ${DEVICE_FRAGMENT}
`

export const PAGINATED_DEVICES = gql`
  query PaginatedDevicesQuery ($page: Int, $pageSize: Int) {
    devices(page: $page, pageSize: $pageSize) {
      entries {
        ...DeviceFragment
        channels {
          name,
          id
        }
        labels {
          name,
          id,
          color,
          channels {
            name,
            id
          }
          function {
            id,
            name
          }
        }
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${DEVICE_FRAGMENT}
`

// For LabelShowTable
export const PAGINATED_DEVICES_BY_LABEL = gql`
  query PaginatedDevicesByLabelQuery ($page: Int, $pageSize: Int, $labelId: String) {
    devices_by_label(page: $page, pageSize: $pageSize, labelId: $labelId) {
      entries {
        name,
        id,
        inserted_at
        labels {
          name,
          color,
          channels {
            id,
            name
          }
          function {
            id,
            name
          }
        }
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`
