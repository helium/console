import { push } from 'react-router-redux';
import * as rest from '../util/rest';
import { normalizeDevice, normalizeDevices } from '../schemas/device'
import { DELETED_ENTITY } from './main'

export const FETCH_DEVICES = 'FETCH_DEVICES'
export const RECEIVED_DEVICES = 'RECEIVED_DEVICES'
export const FETCH_DEVICE = 'FETCH_DEVICE'
export const RECEIVED_DEVICE = 'RECEIVED_DEVICE'


export const fetchDevices = () => {
  return (dispatch) => {
    rest.get('/api/devices')
      .then(response => {
        return dispatch(receivedDevices(response.data))
      })
  }
}

export const receivedDevices = (devices) => {
  const entities = normalizeDevices(devices)

  return {
    type: RECEIVED_DEVICES,
    entities
  }
}

export const fetchDevice = (id) => {
  return (dispatch) => {
    rest.get(`/api/devices/${id}`)
      .then(response => {
        return dispatch(receivedDevice(response.data))
      })
  }
}

export const receivedDevice = (device) => {
  const entities = normalizeDevice(device)

  return {
    type: RECEIVED_DEVICE,
    entities
  }
}

export const createDevice = (params) => {
  return (dispatch) => {
    rest.post('/api/devices', {
        device: params
      })
      .then(response => {})
  }
}

export const updateDevice = (id, params) => {
  return (dispatch) => {
    rest.put(`/api/devices/${id}`, {
      device: params
    })
    .then(response => {
      dispatch(receivedDevice(response.data))
    })
  }
}

export const deleteDevice = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/devices/${id}`)
      .then(response => {
        dispatch(push('/devices'))
      })
  }
}

export const deletedDevice = (device) => {
  return {
    type: DELETED_ENTITY,
    entity: 'devices',
    id: device.id
  }
}
