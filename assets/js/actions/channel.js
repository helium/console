import { push, replace } from 'connected-react-router';
import * as rest from '../util/rest';
import { displayInfo } from '../util/messages'

export const createChannel = (params) => {
  return (dispatch) => {
    rest.post('/api/channels', {
        channel: params
      })
      .then(response => {
        displayInfo(`${response.data.name} has been created`)
        dispatch(replace(`/integrations/${response.data.id}`))
      })
  }
}

export const updateChannel = (id, params) => {
  return (dispatch) => {
    rest.put(`/api/channels/${id}`, {
      channel: params
    })
    .then(() => {})
  }
}

export const deleteChannel = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/channels/${id}`)
      .then(response => {
        dispatch(replace('/integrations'))
      })
  }
}
