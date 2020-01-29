import gql from 'graphql-tag';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id,
    name,
    inserted_at,
  }
`

export const ALL_ORGANIZATIONS = gql`
  query allOrganizationsQuery {
    organizations {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`

export const ORGANIZATION_SUBSCRIPTION = gql`
  subscription onOrganizationAdded($userId: String) {
    organizationAdded(userId: $userId) {
      id,
      name,
      inserted_at,
    }
  }
`
