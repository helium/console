import { gql } from '@apollo/client';

export const MEMBERSHIP_FRAGMENT = gql`
  fragment MembershipFragment on Membership {
    id,
    email,
    role,
    inserted_at
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
