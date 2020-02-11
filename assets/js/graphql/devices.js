import gql from 'graphql-tag';

export const DEVICE_FRAGMENT = gql`
  fragment DeviceFragment on Device {
    name,
    mac,
    id,
    seq_id,
    dev_eui,
    inserted_at,
    channels {
      name,
      id
    }
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
      name,
      seq_id
    }
  }
`

export const PAGINATED_DEVICES = gql`
  query PaginatedDevicesQuery ($page: Int, $pageSize: Int) {
    devices(page: $page, pageSize: $pageSize) {
      entries {
        ...DeviceFragment
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
          color
        }
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`
