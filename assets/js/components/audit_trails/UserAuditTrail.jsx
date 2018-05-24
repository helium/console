// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';

import AuditTable from './AuditTable.jsx'

const query = gql`
  query AuditTrailsQuery ($userId: ID!, $page: Int, $pageSize: Int) {
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

const queryOptions = {
  options: props => ({
    fetchPolicy: 'network-only',
    variables: {
      page: 1,
      pageSize: 10,
      userId: props.userId
    }
  })
}

function mapStateToProps(state, ownProps) {
  return {
    userId: state.auth.user.id,
  }
}

const UserAuditTrail = graphql(query, queryOptions)(AuditTable)
export default connect(mapStateToProps, null)(UserAuditTrail)
