import gql from 'graphql-tag';

export const ALL_API_KEYS = gql`
  query ApiKeysQuery {
    apiKeys {
      id
      name
      role
      inserted_at
      user
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
