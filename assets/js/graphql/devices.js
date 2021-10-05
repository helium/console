import { gql } from "@apollo/client";

export const DEVICE_FRAGMENT = gql`
  fragment DeviceFragment on Device {
    id
    name
    dev_eui
    frame_up
    frame_down
    last_connected
    inserted_at
    total_packets
    dc_usage
    active
    multi_buy_id
    in_xor_filter
    updated_at
    config_profile_id
  }
`;

export const DEVICE_SHOW = gql`
  query DeviceShowQuery($id: ID!) {
    device(id: $id) {
      ...DeviceFragment
      app_eui
      app_key
      labels {
        name
        id
      }
      config_profile {
        name
      }
    }
  }
  ${DEVICE_FRAGMENT}
`;

export const DEVICE_COUNT = gql`
  query DeviceCountQuery {
    device_count {
      count
    }
  }
`;

export const DEVICE_SHOW_STATS = gql`
  query DeviceShowStatsQuery($id: ID!) {
    device_stats(id: $id) {
      packets_last_1d
      packets_last_7d
      packets_last_30d
    }
  }
`;

export const DEVICE_SHOW_DC_STATS = gql`
  query DeviceShowDcStatsQuery($id: ID!) {
    device_dc_stats(id: $id) {
      dc_last_1d
      dc_last_7d
      dc_last_30d
    }
  }
`;

export const ALL_IMPORTS = gql`
  query PaginatedImportsQuery($page: Int, $pageSize: Int) {
    device_imports(page: $page, pageSize: $pageSize) {
      entries {
        id
        user_id
        successful_devices
        status
        type
      }
    }
  }
`;

export const PAGINATED_DEVICES = gql`
  query PaginatedDevicesQuery(
    $page: Int
    $pageSize: Int
    $column: String
    $order: String
  ) {
    devices(page: $page, pageSize: $pageSize, column: $column, order: $order) {
      entries {
        ...DeviceFragment
        labels {
          name
          id
        }
      }
      totalEntries
      totalPages
      pageSize
      pageNumber
    }
  }
  ${DEVICE_FRAGMENT}
`;

// For LabelShowTable
export const PAGINATED_DEVICES_BY_LABEL = gql`
  query PaginatedDevicesByLabelQuery(
    $page: Int
    $pageSize: Int
    $labelId: ID!
    $column: String
    $order: String
  ) {
    devices_by_label(
      page: $page
      pageSize: $pageSize
      labelId: $labelId
      column: $column
      order: $order
    ) {
      entries {
        ...DeviceFragment
        labels {
          id
          name
        }
      }
      totalEntries
      totalPages
      pageSize
      pageNumber
    }
  }
  ${DEVICE_FRAGMENT}
`;
