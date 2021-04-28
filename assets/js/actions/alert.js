import * as rest from '../util/rest';

export const createAlert = (alert) => {
  return (dispatch) => {

    return rest.post('/api/alerts', {
        alert: alert
      })
      .then(response => {})
  }
}

export const deleteAlert = (id) => {
  return (dispatch) => {

    return rest.destroy(`/api/alerts/${id}`).then(response => {});
  }
}

export const updateAlert = (id, alert) => {
  return (dispatch) => {
    return rest.put(`/api/alerts/${id}`, {
      alert: alert
    })
    .then(response => {});
  }
}

export const addAlertToNode = (alertId, nodeId, nodeType) => {
  return (dispatch) => {
    return rest.post('/api/alerts/add_to_node', {
      alert_id: alertId,
      node_id: nodeId,
      node_type: nodeType
    })
    .then(response => {});
  }
}

export const removeAlertFromNode = (alertId, nodeId, nodeType) => {
  return (dispatch) => {
    return rest.post('/api/alerts/remove_from_node', {
      alert_id: alertId,
      node_id: nodeId,
      node_type: nodeType
    })
    .then(response => {});
  }
}