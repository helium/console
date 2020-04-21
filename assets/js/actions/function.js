import { replace } from 'connected-react-router';
import * as rest from '../util/rest';
import sanitizeHtml from 'sanitize-html'

export const createFunction = (params) => {
  return (dispatch) => {
    const functionParams = sanitizeParams(params)

    rest.post('/api/functions', {
        function: functionParams,
      })
      .then(response => {
        dispatch(replace(`/functions/${response.data.id}`))
      })
  }
}

export const updateFunction = (id, params) => {
  return (dispatch) => {
    const functionParams = sanitizeParams(params)

    rest.put(`/api/functions/${id}`, {
      function: functionParams
    })
    .then(() => {})
  }
}

export const deleteFunction = (id, redirect = false) => {
  return (dispatch) => {
    rest.destroy(`/api/functions/${id}`)
      .then(response => {
        if (redirect) dispatch(replace('/functions'))
      })
  }
}

const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  return params
}
