import * as rest from '../util/rest';
import { normalizeChannel, normalizeChannels } from '../schemas/channel'

export const FETCH_CHANNELS = 'FETCH_CHANNELS'
export const RECEIVED_CHANNELS = 'RECEIVED_CHANNELS'
export const FETCH_CHANNEL = 'FETCH_CHANNEL'
export const RECEIVED_CHANNEL = 'RECEIVED_CHANNEL'


export const fetchChannels = () => {
  return (dispatch) => {
    rest.get('/api/channels')
      .then(response => {
        return dispatch(receivedChannels(response.data))
      })
  }
}

export const receivedChannels = (channels) => {
  const entities = normalizeChannels(channels)

  return {
    type: RECEIVED_CHANNELS,
    entities
  }
}

export const fetchChannel = (id) => {
  return (dispatch) => {
    rest.get(`/api/channels/${id}`)
      .then(response => {
        return dispatch(receivedChannel(response.data))
      })
  }
}

export const receivedChannel = (channel) => {
  const entities = normalizeChannel(channel)

  return {
    type: RECEIVED_CHANNEL,
    entities
  }
}
