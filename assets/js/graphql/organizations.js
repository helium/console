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

export const ORGANIZATION_TEAMS_FRAGMENT = gql`
  fragment OrganizationTeamsFragment on Organization {
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

export const CURRENT_ORGANIZATION_TEAMS = gql`
  query currentOrganizationQuery($Id: String) {
    organization(Id: $Id) {
      ...OrganizationTeamsFragment
    }
  }
  ${ORGANIZATION_TEAMS_FRAGMENT}
`

export const TEAM_SUBSCRIPTION = gql`
  subscription onTeamAdded {
    teamAdded {
      id,
      name,
      inserted_at
    }
  }
`
