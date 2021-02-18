import { gql } from '@apollo/client';

export const ALL_API_KEYS = gql`
  query ApiKeysQuery {
    apiKeys {
      id
      name
      role
      inserted_at
      user
      active
    }
  }
`
