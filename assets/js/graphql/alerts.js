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