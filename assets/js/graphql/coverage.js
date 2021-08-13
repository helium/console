import { gql } from '@apollo/client';

export const HOTSPOT_STATS = gql`
  query HotspotStatsQuery {
    hotspotStats {
      hotspot_address
      device_id
    }
  }
`
