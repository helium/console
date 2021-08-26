import { gql } from '@apollo/client';

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
  }
`;

export const HOTSPOT_STATS = gql`
  query HotspotStatsQuery {
    hotspotStats {
      ...HotspotFragment
    }
  }
  ${HOTSPOT_FRAGMENT}
`

export const FOLLOWED_HOTSPOT_STATS = gql`
  query FollowedHotspotStatsQuery {
    followedHotspotStats {
      ...HotspotFragment
    }
  }
  ${HOTSPOT_FRAGMENT}
`

export const HOTSPOT_STATS_DEVICE_COUNT = gql`
  query HotspotStatsDeviceCountQuery {
    hotspotStatsDeviceCount {
      count_1d
      count_2d
    }
  }
`

export const ALL_ORGANIZATION_HOTSPOTS = gql`
  query AllOrganizationHotspotsQuery {
    allOrganizationHotspots {
      hotspot_address
      organization_id
      claimed
      alias
    }
  }
`

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
`
