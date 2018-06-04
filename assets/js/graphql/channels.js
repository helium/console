import gql from 'graphql-tag';

export const CHANNEL_FRAGMENT = gql`
  fragment ChannelFragment on Channel {
    name,
    type,
    type_name,
    id,
    active
  }
`

export const CHANNEL_SUBSCRIPTION = gql`
  subscription onChannelAdded {
    channelAdded {
      ...ChannelFragment
    }
  }
  ${CHANNEL_FRAGMENT}
`
