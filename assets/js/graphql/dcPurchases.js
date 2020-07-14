import gql from 'graphql-tag';

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
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`

export const DC_PURCHASE_SUBSCRIPTION = gql`
  subscription onDcPurchaseAdded {
    dcPurchaseAdded {
      id
    }
  }
`
