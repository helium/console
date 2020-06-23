import gql from 'graphql-tag';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id,
    name,
    inserted_at,
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
    }
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
  subscription onOrganizationAdded {
    organizationAdded {
      id,
      name,
      inserted_at,
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
