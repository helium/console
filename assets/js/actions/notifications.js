import * as rest from '../util/rest';
import { push } from 'react-router-redux';

export const updateNotification = (id, params, url = null) => {
  return (dispatch) => {
    rest.put(`/api/notifications/${id}`, {
      notification: params
    })
    .then(response => {
      if (url) dispatch(push(url))
    })
  }
}
