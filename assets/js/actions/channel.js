import { push, replace } from 'react-router-redux';
import * as rest from '../util/rest';
import { normalizeChannel, normalizeChannels } from '../schemas/channel'
import { DELETED_ENTITY } from './main'
import { displayInfo } from '../util/messages'

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

export const createChannel = (params) => {
  return (dispatch) => {
    rest.post('/api/channels', {
        channel: params
      })
      .then(response => {
        displayInfo(`Channel ${response.data.name} has been created`)
        dispatch(replace(`/channels/${response.data.id}`))
      })
  }
}

export const updateChannel = (id, params) => {
  return (dispatch) => {
    rest.put(`/api/channels/${id}`, {
      channel: params
    })
    .then(response => {
      dispatch(receivedChannel(response.data))
    })
  }
}

export const deleteChannel = (channel) => {
  return (dispatch) => {
    rest.destroy(`/api/channels/${channel.id}`)
      .then(response => {
        dispatch(push('/channels'))
        displayInfo(`${channel.name} deleted`)
      })
  }
}

export const deletedChannel = (channel) => {
  return {
    type: DELETED_ENTITY,
    entity: 'channels',
    id: channel.id
  }
}
