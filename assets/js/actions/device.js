import * as rest from '../util/rest';

export const FETCH_DEVICES = 'FETCH_DEVICES'
export const RECEIVED_DEVICES = 'RECEIVED_DEVICES'
export const RECEIVED_NEW_DEVICE = 'RECEIVED_NEW_DEVICE'
export const FETCH_CURRENT_DEVICE = 'FETCH_CURRENT_DEVICE'
export const RECEIVED_CURRENT_DEVICE = 'RECEIVED_CURRENT_DEVICE'

export const fetchDevices = () => {
  return (dispatch) => {
    rest.get('/api/devices')
      .then(response => {
        return dispatch(receivedDevices(response.data.data)) // TODO why data 2x?
      })
  }
}

export const receivedDevices = (devices) => {
  return {
    type: RECEIVED_DEVICES,
    devices
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
        return dispatch(receivedCurrentDevice(response.data.data)) // TODO why data 2x?
      })
  }
}

export const receivedCurrentDevice = (device) => {
  return {
    type: RECEIVED_CURRENT_DEVICE,
    device
  }
}
