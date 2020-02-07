import * as rest from '../util/rest'
import { replace } from 'connected-react-router';

export const createLabel = (name) => {
  return (dispatch) => {
    rest.post('/api/labels', {
        label: {
          name
        },
      })
      .then(response => {})
  }
}

export const updateLabel = (id, params) => {
  return (dispatch) => {
    rest.put(`/api/labels/${id}`, {
      label: params
    })
    .then(response => {})
  }
}

export const deleteLabel = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/labels/${id}`)
      .then(response => {
        dispatch(replace('/labels'))
      })
  }
}
