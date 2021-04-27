import { gql } from '@apollo/client';

export const ALL_MULTI_BUYS = gql`
  query AllMultiBuysQuery {
    allMultiBuys {
      id,
      name,
      value
    }
  }
`
