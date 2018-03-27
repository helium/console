import { schema, normalize } from 'normalizr'
import * as rest from '../util/rest';

export const FETCH_DEVICES = 'FETCH_DEVICES'
export const RECEIVED_DEVICES = 'RECEIVED_DEVICES'
export const RECEIVED_NEW_DEVICE = 'RECEIVED_NEW_DEVICE'
export const FETCH_CURRENT_DEVICE = 'FETCH_CURRENT_DEVICE'
export const RECEIVED_CURRENT_DEVICE = 'RECEIVED_CURRENT_DEVICE'

const eventEntity = new schema.Entity('events')
const deviceEntity = new schema.Entity('devices', {
  events: [ eventEntity ]
})

export const fetchDevices = () => {
  return (dispatch) => {
    rest.get('/api/devices')
      .then(response => {
        return dispatch(receivedDevices(response.data))
      })
  }
}

export const receivedDevices = (devices) => {
  const deviceSchema = [deviceEntity]
  const normalizedData = normalize(devices, deviceSchema)
  const entities = normalizedData.entities
  console.log(normalizedData)

  return {
    type: RECEIVED_DEVICES,
    devices,
    entities
  }
}

export const receivedNewDevice = (device) => {
  return {
    type: RECEIVED_NEW_DEVICE,
    device
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
  const deviceSchema = deviceEntity
  const normalizedData = normalize(device, deviceSchema)
  const entities = normalizedData.entities
  console.log(normalizedData)

  return {
    type: RECEIVED_CURRENT_DEVICE,
    device,
    entities
  }
}
