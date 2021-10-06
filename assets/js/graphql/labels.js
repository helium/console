import { gql } from "@apollo/client";

export const LABEL_FRAGMENT = gql`
  fragment LabelFragment on Label {
    name
    id
    inserted_at
    creator
    multi_buy_id
    config_profile_id
    devices {
      name
      id
      last_connected
      in_xor_filter
    }
    updated_at
  }
`;

export const LABEL_SHOW = gql`
  query LabelShowQuery($id: ID!) {
    label(id: $id) {
      ...LabelFragment
    }
  }
  ${LABEL_FRAGMENT}
`;

// For LabelAddDeviceModal
export const ALL_LABELS_DEVICES = gql`
  query LabelsDevicesQuery {
    allLabels {
      id
      name
      device_count
      devices {
        config_profile_id
      }
    }
    allDevices {
      id
      name
      config_profile_id
    }
  }
`;

export const ALL_LABELS = gql`
  query AllLabelsQuery {
    allLabels {
      id
      name
      device_count
      devices {
        id
        in_xor_filter
      }
      config_profile_id
    }
  }
`;

// For DeviceShowLabelsTable
export const PAGINATED_LABELS_BY_DEVICE = gql`
  query PaginatedLabelsByDeviceQuery(
    $page: Int
    $pageSize: Int
    $deviceId: ID!
    $column: String
    $order: String
  ) {
    labels_by_device(
      page: $page
      pageSize: $pageSize
      deviceId: $deviceId
      column: $column
      order: $order
    ) {
      entries {
        name
        id
        inserted_at
      }
      totalEntries
      totalPages
      pageSize
      pageNumber
    }
  }
`;
