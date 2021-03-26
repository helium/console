import { gql } from '@apollo/client';

export const ALL_RESOURCES = gql`
  query AllResourcesQuery ($id: ID!) {
    allDevices {
      id,
      name
    }
    allLabels {
      id,
      name,
      color,
      device_count
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
      type,
      endpoint
    }
    organization(id: $id) {
      flow
    }
  }
`
