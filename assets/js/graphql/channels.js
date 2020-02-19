import gql from 'graphql-tag';

export const CHANNEL_FRAGMENT = gql`
  fragment ChannelFragment on Channel {
    name,
    type,
    type_name,
    id,
    active,
    default,
    show_dupes
  }
`

export const CHANNEL_SHOW = gql`
  query ChannelShowQuery ($id: ID!) {
    channel(id: $id) {
      ...ChannelFragment
      method
      endpoint
      inbound_token
      headers
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
          color
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
