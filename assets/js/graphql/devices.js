import gql from 'graphql-tag';

export const DEVICE_FRAGMENT = gql`
  fragment DeviceFragment on Device {
    name,
    mac,
    id
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
