import { gql } from '@apollo/client';

export const ALL_RESOURCES = gql`
  query AllResourcesQuery {
    allLabels {
      id,
      name,
      color,
      channels {
        id,
        name,
        type_name,
        type
      },
      function {
        id,
        name,
        format
      }
    }
    allFunctions {
      id,
      name,
      format
    }
    allChannels {
      id,
      name,
      type_name,
      type
    }
  }
`
