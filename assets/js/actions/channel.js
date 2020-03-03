import { push, replace } from 'connected-react-router';
import * as rest from '../util/rest';
import { displayInfo } from '../util/messages'
import sanitizeHtml from 'sanitize-html'

export const createChannel = (params, labels) => {
  return (dispatch) => {
    const channelParams = sanitizeParams(params)

    rest.post('/api/channels', {
        channel: channelParams,
        labels
      })
      .then(response => {
        displayInfo(`${response.data.name} has been created`)
        dispatch(replace(`/integrations/${response.data.id}`))
      })
  }
}

export const updateChannel = (id, params) => {
  return (dispatch) => {
    const channelParams = sanitizeParams(params)

    rest.put(`/api/channels/${id}`, {
      channel: channelParams
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

const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  if (params.credentials && params.credentials.endpoint) params.credentials.endpoint = sanitizeHtml(params.credentials.endpoint)
  if (params.credentials && params.credentials.headers) {
    const headers = {}
    Object.keys(params.credentials.headers).forEach(k => headers[sanitizeHtml(k)] = sanitizeHtml(params.credentials.headers[k]) )
    params.credentials.headers = headers
  }
  return params
}
