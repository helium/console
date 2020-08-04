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
    dc_usage,
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

export const IMPORT_ADDED_SUBSCRIPTION = gql`
  subscription onImportAdded {
    importAdded {
      id,
      user_id,
      successful_devices,
      status,
      type
    }
  }
`

export const IMPORT_UPDATED_SUBSCRIPTION = gql`
  subscription onImportUpdated {
    importUpdated {
      id,
      user_id,
      successful_devices,
      status,
      type
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

export const ALL_IMPORTS = gql`
  query PaginatedImportsQuery ($page: Int, $pageSize: Int) {
    device_imports(page: $page, pageSize: $pageSize) {
      entries {
        id,
        user_id,
        successful_devices,
        status,
        type
      }
    }
  }
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
