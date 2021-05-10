import { push, replace } from 'connected-react-router';
import * as rest from '../util/rest';
import { displayInfo, displayError } from '../util/messages';
import sanitizeHtml from 'sanitize-html';

export const createChannel = (params) => {
  return (dispatch) => {
    const channelParams = sanitizeParams(params.channel)

    rest.post('/api/channels', {
        channel: channelParams
      })
      .then(response => {
        displayInfo(`Integration ${response.data.name} added successfully`)
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
  if (params.credentials && params.credentials.endpoint) {
    params.credentials.endpoint = sanitizeHtml(params.credentials.endpoint).replaceAll('&amp;', "&")
  }
  if (params.credentials && params.credentials.headers) {
    const headers = {}
    Object.keys(params.credentials.headers).forEach(k => headers[sanitizeHtml(k)] = sanitizeHtml(params.credentials.headers[k]) )
    params.credentials.headers = headers
  }
  if (params.credentials && params.credentials.url_params) {
    const url_params = {}
    Object.keys(params.credentials.url_params).forEach(k => url_params[sanitizeHtml(k)] = sanitizeHtml(params.credentials.url_params[k]) )
    params.credentials.url_params = url_params
  }
  return params
}
