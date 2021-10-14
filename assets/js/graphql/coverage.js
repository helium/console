import { gql } from "@apollo/client";

const HOTSPOT_FRAGMENT = gql`
  fragment HotspotFragment on Hotspot {
    hotspot_address
    hotspot_name
    packet_count
    device_count
    packet_count_2d
    device_count_2d
    status
    long_city
    short_country
    short_state
    longitude
    latitude
    alias
    avg_rssi
    total_entries
  }
`;

export const HOTSPOT_STATS = gql`
  query HotspotStatsQuery(
    $column: String
    $order: String
    $page: Int
    $pageSize: Int
  ) {
    hotspotStats(
      column: $column
      order: $order
      page: $page
      pageSize: $pageSize
    ) {
      ...HotspotFragment
    }
  }
  ${HOTSPOT_FRAGMENT}
`;

export const FOLLOWED_HOTSPOT_STATS = gql`
  query FollowedHotspotStatsQuery(
    $column: String
    $order: String
    $page: Int
    $pageSize: Int
  ) {
    followedHotspotStats(
      column: $column
      order: $order
      page: $page
      pageSize: $pageSize
    ) {
      ...HotspotFragment
    }
  }
  ${HOTSPOT_FRAGMENT}
`;

export const HOTSPOT_STATS_DEVICE_COUNT = gql`
  query HotspotStatsDeviceCountQuery {
    hotspotStatsDeviceCount {
      count_1d
    }
  }
`;

export const ALL_ORGANIZATION_HOTSPOTS = gql`
  query AllOrganizationHotspotsQuery {
    allOrganizationHotspots {
      hotspot_address
      organization_id
      claimed
      alias
    }
  }
`;

export const HOTSPOT_SHOW = gql`
  query HotspotShowQuery($address: String) {
    hotspot(address: $address) {
      ...HotspotFragment
      most_heard_device_id
      most_heard_device_name
      most_heard_packet_count
    }
  }
  ${HOTSPOT_FRAGMENT}
`;

export const HOTSPOT_SHOW_PACKETS = gql`
  query HotspotShowPacketsQuery($address: String) {
    hotspotPackets(address: $address) {
      device_id
      reported_at_epoch
    }
  }
`;

export const HOTSPOT_SHOW_DEVICES_HEARD = gql`
  query HotspotShowDevicesHeardQuery(
    $address: String
    $column: String
    $order: String
    $page: Int
    $pageSize: Int
  ) {
    hotspotDevicesHeard(
      address: $address
      column: $column
      order: $order
      page: $page
      pageSize: $pageSize
    ) {
      device_id
      device_name
      packet_count
      reported_at
      total_entries
      rssi
      snr
    }
  }
`;
