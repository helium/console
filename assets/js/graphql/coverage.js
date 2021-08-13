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
