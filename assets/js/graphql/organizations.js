import gql from 'graphql-tag';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id,
    name,
    inserted_at,
  }
`

export const PAGINATED_ORGANIZATIONS = gql`
  query PaginatedOrganizationsQuery($page: Int, $pageSize: Int) {
    organizations(page: $page, pageSize: $pageSize) {
      entries {
        ...OrganizationFragment
      }
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${ORGANIZATION_FRAGMENT}
`

export const ORGANIZATION_SUBSCRIPTION = gql`
  subscription onOrganizationUpdated {
    organizationUpdated {
      id,
      name,
      inserted_at,
    }
  }
`
