import { push, replace } from 'connected-react-router';
import * as rest from '../util/rest';

export const createDevice = (params) => {
  return (dispatch) => {
    rest.post('/api/devices', {
        device: params
      })
      .then(response => {})
  }
}

export const setDeviceChannel = (id, params) => {
  return (dispatch) => {
    rest.post(`/api/devices/${id}/channel`, {
      channel: params
    })
    .then(response => {})
  }
}

export const deleteDeviceChannel = (id, params) => {
  return (dispatch) => {
    rest.destroy(`/api/devices/${id}/channel?channel_id=${params.id}`, {
      channel: params
    })
    .then(response => {})
  }
}

export const updateDevice = (id, params) => {
  return (dispatch) => {
    rest.put(`/api/devices/${id}`, {
      device: params
    })
    .then(response => {})
  }
}

export const deleteDevice = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/devices/${id}`)
      .then(response => {
        dispatch(replace('/devices'))
      })
  }
}
