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

export const API_KEY_SUBSCRIPTION = gql`
  subscription onApiKeyAdded {
    apiKeyAdded {
      id
    }
  }
`
