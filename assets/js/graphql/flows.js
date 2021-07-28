import { gql } from "@apollo/client";

export const ALL_RESOURCES = gql`
  query AllResourcesQuery($id: ID!) {
    allDevices {
      id
      name
      adr_allowed
      cf_list_enabled
      in_xor_filter
      multi_buy_id
      alerts {
        id
        name
      }
    }
    allLabels {
      id
      name
      device_count
      adr_allowed
      cf_list_enabled
      multi_buy_id
      alerts {
        id
        name
      }
      devices {
        in_xor_filter
      }
    }
    allFunctions {
      id
      name
      format
      alerts {
        id
        name
      }
    }
    allChannels {
      id
      name
      type_name
      type
      endpoint
      alerts {
        id
        name
      }
    }
    organization(id: $id) {
      flow
    }
  }
`;

export const FLOWS_BY_DEVICE = gql`
  query FlowsByDevice($deviceId: ID!) {
    flowsByDevice(deviceId: $deviceId) {
      id
      organization_id
      device_id
      label_id
      function_id
      channel_id
    }
  }
`;

export const GET_RESOURCES_NAMES = gql`
  query GetResourcesNames(
    $deviceIds: [ID]!
    $channelIds: [ID]!
    $functionIds: [ID]!
    $labelIds: [ID]!
  ) {
    deviceNames(deviceIds: $deviceIds) {
      id
      name
    }
    channelNames(channelIds: $channelIds) {
      id
      name
    }
    functionNames(functionIds: $functionIds) {
      id
      name
    }
    labelNames(labelIds: $labelIds) {
      id
      name
    }
  }
`;
