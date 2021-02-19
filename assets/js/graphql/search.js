import { gql } from '@apollo/client';

export const GENERAL_SEARCH = gql`
  query SearchQuery ($query: String) {
    searchResults(query: $query) {
      id,
      title,
      description,
      category,
      score,
      url
    }
  }
`

export const SEARCH_DEVICES = gql`
  query SearchDevicesQuery ($query: String) {
    searchDevices(query: $query) {
      id,
      name,
    }
  }
`

export const SEARCH_LABELS = gql`
  query SearchLabelsQuery ($query: String) {
    searchLabels(query: $query) {
      id,
      name,
    }
  }
`

export const SEARCH_FUNCTIONS = gql`
  query SearchFunctionsQuery ($query: String) {
    searchFunctions(query: $query) {
      id,
      name,
    }
  }
`
