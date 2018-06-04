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
  subscription onChannelAdded($teamId: String) {
    channelAdded(teamId: $teamId) {
      ...ChannelFragment
    }
  }
  ${CHANNEL_FRAGMENT}
`
