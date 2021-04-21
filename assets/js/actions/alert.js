import * as rest from '../util/rest';

export const createAlert = (alert) => {
  return (dispatch) => {

    return rest.post('/api/alerts', {
        alert: alert
      })
      .then(response => {})
  }
}