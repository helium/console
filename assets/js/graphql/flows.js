import gql from 'graphql-tag';

export const ALL_RESOURCES = gql`
  query AllResourcesQuery {
    allLabels {
      id,
      name,
      color,
      channels {
        id,
        name
      },
      function {
        id,
        name,
        format
      }
    }
    allFunctions {
      id,
      name
    }
    allChannels {
      id,
      name,
    }
  }
`
