import * as rest from '../util/rest';
import { normalizeDevice, normalizeDevices } from '../schemas/device'

export const FETCH_DEVICES = 'FETCH_DEVICES'
export const RECEIVED_DEVICES = 'RECEIVED_DEVICES'
export const FETCH_CURRENT_DEVICE = 'FETCH_CURRENT_DEVICE'
export const RECEIVED_CURRENT_DEVICE = 'RECEIVED_CURRENT_DEVICE'


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

export const fetchCurrentDevice = (id) => {
  return (dispatch) => {
    rest.get(`/api/devices/${id}`)
      .then(response => {
        return dispatch(receivedCurrentDevice(response.data))
      })
  }
}

export const receivedCurrentDevice = (device) => {
  const entities = normalizeDevice(device)

  return {
    type: RECEIVED_CURRENT_DEVICE,
    entities
  }
}
