import { gql } from '@apollo/client';

export const INVITATION_FRAGMENT = gql`
  fragment InvitationFragment on Invitation {
    id,
    email,
    role,
    inserted_at
  }
`

export const PAGINATED_INVITATIONS = gql`
  query PaginatedInvitationsQuery ($page: Int, $pageSize: Int) {
    invitations(page: $page, pageSize: $pageSize) {
      entries {
        ...InvitationFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${INVITATION_FRAGMENT}
`
export const INVITATION_SUBSCRIPTION = gql`
  subscription onInvitationUpdated {
    invitationUpdated {
      ...InvitationFragment
    }
  }
  ${INVITATION_FRAGMENT}
`
