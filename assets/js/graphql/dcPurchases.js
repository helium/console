import { gql } from '@apollo/client';

export const PAGINATED_DC_PURCHASES = gql`
  query PaginatedDcPurchasesQuery ($page: Int, $pageSize: Int) {
    dcPurchases(page: $page, pageSize: $pageSize) {
      entries {
        id
        dc_purchased
        cost
        card_type
        last_4
        user_id
        inserted_at
        payment_id
        from_organization
        to_organization
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`
