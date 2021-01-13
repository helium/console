import gql from 'graphql-tag';

export const LABEL_FRAGMENT = gql`
  fragment LabelFragment on Label {
    name,
    id,
    color,
    inserted_at,
    creator,
    multi_buy,
    adr_enabled,
    devices {
      name,
      id
    }
    channels {
      name,
      id,
      type,
      downlink_token
    }
    function {
      id,
      name
    }
    label_notification_settings {
      key,
      value,
      recipients,
      label_id
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
  query PaginatedLabelsQuery ($page: Int, $pageSize: Int) {
    labels(page: $page, pageSize: $pageSize) {
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

export const LABEL_SUBSCRIPTION = gql`
  subscription onLabelAdded {
    labelAdded {
      name,
      id
    }
  }
`

export const LABEL_SUBSCRIPTION_FOR_NAV = gql`
  subscription onLabelAddedForNav {
    labelAddedForNav {
      name,
      id
    }
  }
`

export const LABEL_UPDATE_SUBSCRIPTION = gql`
  subscription onLabelUpdated($id: String) {
    labelUpdated(id: $id) {
      name,
      id
    }
  }
`

// For LabelAddDeviceModal
export const ALL_LABELS_DEVICES = gql`
  query LabelsDevicesQuery {
    allLabels {
      id,
      name,
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
      channels {
        id,
        name
      },
      function {
        id,
        name,
        format
      }
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
