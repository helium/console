import { gql } from "@apollo/client";

export const PACKET_CONFIG_SHOW = gql`
  query PacketConfigShowQuery($id: ID!) {
    packetConfig(id: $id) {
      id
      name
      multi_buy_value
      multi_active
      preferred_active
    }
  }
`;

export const ALL_PACKET_CONFIGS = gql`
  query AllPacketConfigsQuery {
    allPacketConfigs {
      id
      name
      multi_buy_value
      multi_active
      preferred_active
    }
  }
`;
