import * as rest from '../util/rest'

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
