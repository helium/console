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

    return rest.destroy(`/api/alerts/${id}`)
      .then(response => {})
  }
}

export const updateAlert = (id, alert) => {
  return (dispatch) => {

    return rest.put(`/api/alerts/${id}`, {
        alert: alert
      })
      .then(response => {})
  }
}