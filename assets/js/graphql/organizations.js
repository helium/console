import gql from 'graphql-tag';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id,
    name,
    inserted_at,
    teams {
      id,
      name,
      inserted_at
    }
  }
`

export const ALL_ORGANIZATIONS = gql`
  query OrganizationsQuery {
    organizations {
      ...OrganizationFragment
    }
  }
  ${ORGANIZATION_FRAGMENT}
`
