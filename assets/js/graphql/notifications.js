import gql from 'graphql-tag';

export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFragment on Notification {
    id,
    title,
    body,
    category,
    url,
    active,
    insertedAt
  }
`

// export const DEVICE_SUBSCRIPTION = gql`
//   subscription onDeviceAdded {
//     deviceAdded {
//       ...DeviceFragment
//     }
//   }
//   ${DEVICE_FRAGMENT}
// `

export const PAGINATED_NOTIFICATIONS = gql`
  query PaginatedNotificationsQuery ($page: Int, $pageSize: Int) {
    notifications(page: $page, pageSize: $pageSize) {
      entries {
        ...NotificationFragment
      },
      totalEntries
    }
  }
  ${NOTIFICATION_FRAGMENT}
`
