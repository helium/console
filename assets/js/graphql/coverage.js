import { gql } from '@apollo/client';

const HOTSPOT_STAT_FRAGMENT = gql`
  fragment HotspotStatFragment on HotspotStats {
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
      ...HotspotStatFragment
    }
  }
  ${HOTSPOT_STAT_FRAGMENT}
`

export const FOLLOWED_HOTSPOT_STATS = gql`
  query FollowedHotspotStatsQuery {
    followedHotspotStats {
      ...HotspotStatFragment
    }
  }
  ${HOTSPOT_STAT_FRAGMENT}
`

export const HOTSPOT_STATS_DEVICE_COUNT = gql`
  query HotspotStatsDeviceCountQuery {
    hotspotStatsDeviceCount {
      count
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
  query HotspotShowQuery(
    $address: String
  ) {
    hotspot(address: $address) {
      hotspot_address
      hotspot_name
      status
      long_city
      short_country
      short_state
    }
  }
`
