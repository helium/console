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
    }
  }
  ${CHANNEL_FRAGMENT}
`

export const PAGINATED_CHANNELS = gql`
  query PaginatedChannelsQuery ($page: Int, $pageSize: Int) {
    channels(page: $page, pageSize: $pageSize) {
      entries {
        ...ChannelFragment
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
