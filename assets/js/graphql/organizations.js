import gql from 'graphql-tag';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id,
    name,
    inserted_at,
    dc_balance,
  }
`

export const ORGANIZATION_SHOW_DC = gql`
  query OrganizationShowQuery ($id: ID!) {
    organization(id: $id) {
      id,
      name,
      dc_balance,
      stripe_customer_id,
      default_payment_id,
      automatic_charge_amount,
      automatic_payment_method,
      dc_balance_nonce
    }
  }
`

export const PAGINATED_ORGANIZATIONS = gql`
  query PaginatedOrganizationsQuery($page: Int, $pageSize: Int) {
    organizations(page: $page, pageSize: $pageSize) {
      entries {
        ...OrganizationFragment
        inactive_count
        active_count
        active
      }
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${ORGANIZATION_FRAGMENT}
`

export const ALL_ORGANIZATIONS = gql`
  query AllOrganizationsQuery {
    allOrganizations {
      id,
      name,
      dc_balance,
      inactive_count,
      active_count
    }
  }
`

export const ORGANIZATION_SUBSCRIPTION = gql`
  subscription onOrganizationAdded {
    organizationAdded {
      id,
      name,
      inserted_at,
    }
  }
`

export const ORGANIZATIONS_SUBSCRIPTION = gql`
  subscription onOrganizationsAddDelete {
    organizationsAddedDeleted {
      id,
      name,
      inserted_at
    }
  }
`

export const ORGANIZATION_UPDATE_SUBSCRIPTION = gql`
  subscription onOrganizationUpdated($organizationId: String) {
    organizationUpdated(organizationId: $organizationId) {
      name
    }
  }
`
