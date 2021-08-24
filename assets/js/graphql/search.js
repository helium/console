import { gql } from "@apollo/client";

export const GENERAL_SEARCH = gql`
  query SearchQuery($query: String) {
    searchResults(query: $query) {
      id
      title
      description
      category
      score
      url
    }
  }
`;

export const SEARCH_DEVICES = gql`
  query SearchDevicesQuery($query: String) {
    searchDevices(query: $query) {
      id
      name
    }
  }
`;

export const SEARCH_LABELS = gql`
  query SearchLabelsQuery($query: String) {
    searchLabels(query: $query) {
      id
      name
    }
  }
`;

export const SEARCH_FUNCTIONS = gql`
  query SearchFunctionsQuery($query: String) {
    searchFunctions(query: $query) {
      id
      name
    }
  }
`;

export const SEARCH_HOTSPOTS = gql`
  query paginatedSearchHotspotsQuery(
    $query: String
    $page: Int
    $pageSize: Int
    $column: String
    $order: String
  ) {
    searchHotspots(
      query: $query
      page: $page
      pageSize: $pageSize
      column: $column
      order: $order
    ) {
      entries {
        hotspot_address
        hotspot_name
        long_city
        short_state
        short_country
        status
        packet_count
        packet_count_2d
        device_count
        device_count_2d
      }
      totalEntries
      totalPages
      pageSize
      pageNumber
    }
  }
`;
