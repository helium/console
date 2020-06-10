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
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`

// export const API_KEY_SUBSCRIPTION = gql`
//   subscription onApiKeyAdded {
//     apiKeyAdded {
//       id
//     }
//   }
// `
