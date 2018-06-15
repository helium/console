import gql from 'graphql-tag';

export const MEMBERSHIP_FRAGMENT = gql`
  fragment MembershipFragment on Membership {
    id,
    email,
    role,
    inserted_at,
    two_factor_enabled
  }
`

export const PAGINATED_MEMBERSHIPS = gql`
  query PaginatedMembershipsQuery ($page: Int, $pageSize: Int) {
    memberships(page: $page, pageSize: $pageSize) {
      entries {
        ...MembershipFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${MEMBERSHIP_FRAGMENT}
`

export const MEMBERSHIP_SUBSCRIPTION = gql`
  subscription onMembershipAdded {
    membershipAdded {
      ...MembershipFragment
    }
  }
  ${MEMBERSHIP_FRAGMENT}
`
