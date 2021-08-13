import { gql } from '@apollo/client';

export const HOTSPOT_STATS = gql`
  query HotspotStatsQuery {
    hotspotStats {
      hotspot_address
      packet_count
      device_count
    }
  }
`
