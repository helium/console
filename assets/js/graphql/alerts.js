import { gql } from '@apollo/client';

export const ALERT_FRAGMENT = gql`
  fragment AlertFragment on Alert {
    id,
    name,
    last_triggered_at,
    node_type,
    config,
    organization_id
  }
`

export const ALERT_SHOW = gql`
  query AlertShowQuery ($id: ID!) {
    alert(id: $id) {
      ...AlertFragment
    },
  }
  ${ALERT_FRAGMENT}
`

export const ALL_ALERTS = gql`
  query AllAlertsQuery {
    allAlerts {
      id,
      name,
      node_type,
      last_triggered_at,
      config
    }
  }
`

export const ALERTS_PER_TYPE = gql`
  query AlertsPerTypeQuery ($type: String!) {
    alertsPerType(type: $type) {
      id,
      name,
      node_type,
      config
    }
  }
`

export const ALERTS_FOR_NODE = gql`
  query AlertsForNodeQuery ($node_id: ID!, $node_type: String!) {
    alertsForNode(node_id: $node_id, node_type: $node_type) {
      id,
      name,
      node_type,
      config
    }
  }
`