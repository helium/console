import { gql } from '@apollo/client';

export const CHANNEL_FRAGMENT = gql`
  fragment ChannelFragment on Channel {
    name,
    type,
    type_name,
    id,
    active,
    credentials {
      endpoint,
      downlink {
        topic
      }
      uplink {
        topic
      }
    }
  }
`

export const CHANNEL_SHOW = gql`
  query ChannelShowQuery ($id: ID!) {
    channel(id: $id) {
      ...ChannelFragment
      downlink_token
      method
      endpoint
      inbound_token
      headers
      aws_region
      aws_access_key
      topic
      payload_template
      labels {
        name,
        id,
        color,
      }
      devices {
        name,
        id
      }
    }
    allLabels {
      name,
      id,
      color,
      device_count
      channels {
        name,
        id
      }
      function {
        id
        name
        format
      }
    }
  }
  ${CHANNEL_FRAGMENT}
`

export const CHANNEL_SUBSCRIPTION = gql`
  subscription onChannelAdded {
    channelAdded {
      ...ChannelFragment
    }
  }
  ${CHANNEL_FRAGMENT}
`

export const CHANNEL_UPDATE_SUBSCRIPTION = gql`
  subscription onChannelUpdated($channelId: String) {
    channelUpdated(channelId: $channelId) {
      name
    }
  }
`

export const PAGINATED_CHANNELS = gql`
  query PaginatedChannelsQuery ($page: Int, $pageSize: Int) {
    channels(page: $page, pageSize: $pageSize) {
      entries {
        ...ChannelFragment
        labels {
          name,
          id,
          color,
          function {
            id,
            name
          }
        },
        device_count
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${CHANNEL_FRAGMENT}
`

export const ALL_CHANNELS = gql`
  query AllChannelsQuery {
    allChannels {
      id,
      name,
    }
  }
`

export const ALL_CHANNELS_FUNCTIONS = gql`
  query AllChannelsFunctionsQuery {
    allChannels {
      id,
      name,
    }
    allFunctions {
      id,
      name,
    }
  }
`
