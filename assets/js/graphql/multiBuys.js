import { gql } from '@apollo/client';

export const MULTI_BUY_SHOW = gql`
  query MultiBuyShowQuery ($id: ID!) {
    multiBuy(id: $id) {
      id,
      name,
      value
    },
  }
`

export const ALL_MULTI_BUYS = gql`
  query AllMultiBuysQuery {
    allMultiBuys {
      id,
      name,
      value
    }
  }
`
