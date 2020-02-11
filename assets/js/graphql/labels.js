import gql from 'graphql-tag';

export const LABEL_FRAGMENT = gql`
  fragment LabelFragment on Label {
    name,
    id,
    color,
    inserted_at,
    devices{
      name,
      id
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

// For LabelAddDeviceModal
export const LABELS_DEVICES = gql`
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

// For NavDrawer
export const MENU_LABELS = gql`
  query MenuLabelsQuery {
    allLabels {
      id,
      name,
      color
    }
  }
`
