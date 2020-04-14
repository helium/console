import * as rest from '../util/rest';
import sanitizeHtml from 'sanitize-html'

export const createFunction = (params) => {
  return (dispatch) => {
    const functionParams = sanitizeParams(params)

    rest.post('/api/functions', {
        function: functionParams,
      })
      .then(response => {})
  }
}

const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  return params
}
