import gql from 'graphql-tag';

export const PAGINATED_AUDIT_TRAILS = gql`
  query AuditTrailsQuery ($userId: ID, $page: Int, $pageSize: Int) {
    auditTrails (userId: $userId, page: $page, pageSize: $pageSize) {
      entries {
        id
        userEmail
        object
        action
        description
        updatedAt
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`
