import { gql } from '@apollo/client';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on Organization {
    id,
    name,
    inserted_at,
    dc_balance,
    webhook_key
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
      dc_balance_nonce,
      received_free_dc,
      webhook_key
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
      active_count,
      received_free_dc,
      webhook_key
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

export const TOP_BAR_ORGANIZATIONS_SUBSCRIPTION = gql`
  subscription topBarOrganizations {
    topBarOrganizations {
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
