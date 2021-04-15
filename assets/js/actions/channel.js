import { push, replace } from 'connected-react-router';
import * as rest from '../util/rest';
import { displayInfo, displayError } from '../util/messages';
import sanitizeHtml from 'sanitize-html';

export const createChannel = (params) => {
  return (dispatch) => {
    const channelParams = sanitizeParams(params.channel)

    rest.post('/api/channels', {
        channel: channelParams,
        labels: params.labels ? params.labels : undefined,
        func: params.func ? params.func : undefined
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

export const sendDownlinkMessage = (payload, port, confirmed, position, device, channels) => {
  return async (dispatch) => {
    if (device) {
      for (let i = 0; i < channels.length; i++) {
        await postToDownlinkController(payload, port, confirmed, position, device, channels[i])
      }
    } else {
      for (let i = 0; i < channels.length; i++) {
        await postToDownlinkController(payload, port, confirmed, position, "", channels[i])
      }
    }
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
  return params
}

const postToDownlinkController = (payload, port, confirmed, position, device, channel) => {
  return rest.post(
    `/api/v1/down/${channel.id}/${channel.downlink_token}/${device}`,
    { payload_raw: payload, port, confirmed, position, from: 'console_downlink_queue' }
  )
  .then(() => {displayInfo(`Successfully queued downlink for integration ${channel.name}`)})
  .catch(() => {displayError(`Failed to queue downlink for integration ${channel.name}`)})
}
