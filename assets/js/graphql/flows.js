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

export const FLOWS_BY_DEVICE = gql`
  query FlowsByDevice ($deviceId: ID!) {
    flowsByDevice(deviceId: $deviceId) {
      id,
      organization_id,
      device_id,
      label_id,
      function_id,
      channel_id
    }
  }
`

export const GET_RESOURCES_NAMES = gql`
  query GetResourcesNames ($deviceIds: [ID]!, $channelIds: [ID]!, $functionIds: [ID]!, $labelIds: [ID]!) {
    deviceNames(deviceIds: $deviceIds) {
      id,
      name
    }
    channelNames(channelIds: $channelIds) {
      id,
      name
    }
    functionNames(functionIds: $functionIds) {
      id,
      name
    }
    labelNames(labelIds: $labelIds) {
      id,
      name
    }
  }
`