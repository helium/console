// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import AuditTable from './AuditTable.jsx'

const query = gql`
  query AuditTrailsQuery ($page: Int, $pageSize: Int) {
    auditTrails (page: $page, pageSize: $pageSize) {
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

const queryOptions = {
  options: props => ({
    fetchPolicy: 'network-only',
    variables: {
      page: 1,
      pageSize: 10
    }
  })
}

const TeamAuditTrail = graphql(query, queryOptions)(AuditTable)
export default TeamAuditTrail
