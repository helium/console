import { gql } from '@apollo/client';

export const LABEL_FRAGMENT = gql`
  fragment LabelFragment on Label {
    name,
    id,
    color,
    inserted_at,
    creator,
    multi_buy,
    adr_allowed,
    devices {
      name,
      id,
      last_connected
    }
    label_notification_settings {
      key,
      value,
      recipients,
      label_id
    }
    label_notification_webhooks {
      key,
      url,
      notes,
      label_id,
      value
    }
  }
`

export const LABEL_SHOW = gql`
  query LabelShowQuery ($id: ID!) {
    label(id: $id) {
      ...LabelFragment
    },
  }
  ${LABEL_FRAGMENT}
`

export const PAGINATED_LABELS = gql`
  query PaginatedLabelsQuery ($page: Int, $pageSize: Int, $column: String, $order: String) {
    labels(page: $page, pageSize: $pageSize, column: $column, order: $order) {
      entries {
        ...LabelFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${LABEL_FRAGMENT}
`

// For LabelAddDeviceModal
export const ALL_LABELS_DEVICES = gql`
  query LabelsDevicesQuery {
    allLabels {
      id,
      name,
      device_count
    }
    allDevices {
      id,
      name,
    }
  }
`

export const ALL_LABELS = gql`
  query AllLabelsQuery {
    allLabels {
      id,
      name,
      color,
    }
  }
`

// For NavDrawer
export const MENU_LABELS = gql`
  query MenuLabelsQuery {
    allLabels {
      id,
      name,
      color,
      device_count
    }
  }
`

// For DeviceShowLabelsTable
export const PAGINATED_LABELS_BY_DEVICE = gql`
  query PaginatedLabelsByDeviceQuery ($page: Int, $pageSize: Int, $deviceId: ID!, $column: String, $order: String) {
    labels_by_device(page: $page, pageSize: $pageSize, deviceId: $deviceId, column: $column, order: $order) {
      entries {
        name,
        id,
        color,
        inserted_at
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`
