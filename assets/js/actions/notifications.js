import * as rest from '../util/rest';
import { push } from 'react-router-redux';

export const createNotification = (params) => {
  return (dispatch) => {
    rest.post('/api/notifications', {
        notification: params
      })
      .then(response => {})
  }
}

export const markRead = (id, params, url = null) => {
  return (dispatch) => {
    rest.post(`/api/notifications/${id}/view`)
    .then(response => {
      if (url) dispatch(push(url))
    })
  }
}

export const clearAll = () => {
  return (dispatch) => {
    rest.post(`/api/notifications/clear`)
    .then(response => { })
  }
}
