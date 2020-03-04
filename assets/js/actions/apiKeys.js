import * as rest from '../util/rest';
import sanitizeHtml from 'sanitize-html'

export const generateKey = (name, role) => (dispatch) => (
  rest.post('/api/api_keys', {
        api_key: {
          name: sanitizeHtml(name),
          role
        }
      })
      .then(({ data }) => data)
)

export const deleteKey = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/api_keys/${id}`)
      .then(response => {})
  }
}
