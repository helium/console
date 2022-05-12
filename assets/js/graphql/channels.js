import { gql } from "@apollo/client";

export const CHANNEL_FRAGMENT = gql`
  fragment ChannelFragment on Channel {
    name
    type
    type_name
    id
    active
    updated_at
    number_devices
  }
`;

export const CHANNEL_SHOW = gql`
  query ChannelShowQuery($id: ID!) {
    channel(id: $id) {
      ...ChannelFragment
      downlink_token
      method
      credentials {
        endpoint
        downlink {
          topic
        }
        uplink {
          topic
        }
      }
      endpoint
      headers
      url_params
      aws_region
      aws_access_key
      topic
      payload_template
      receive_joins
      azure_hub_name
      azure_policy_name
      azure_policy_key
      iot_central_api_key
      iot_central_scope_id
      iot_central_app_name
      last_errored
    }
  }
  ${CHANNEL_FRAGMENT}
`;

export const PAGINATED_CHANNELS = gql`
  query PaginatedChannelsQuery($page: Int, $pageSize: Int) {
    channels(page: $page, pageSize: $pageSize) {
      entries {
        ...ChannelFragment
      }
      totalEntries
      totalPages
      pageSize
      pageNumber
    }
  }
  ${CHANNEL_FRAGMENT}
`;

export const ALL_CHANNELS = gql`
  query AllChannelsQuery {
    allChannels {
      name
      type
      type_name
      id
      active
      last_errored
    }
  }
`;
