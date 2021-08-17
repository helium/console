import { gql } from '@apollo/client';

export const HOTSPOT_STATS = gql`
  query HotspotStatsQuery {
    hotspotStats {
      hotspot_address
      hotspot_name
      packet_count
      device_count
      status
      long_city
      short_country
      short_state
    }
  }
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
