import { push, replace } from 'connected-react-router';
import * as rest from '../util/rest';
import sanitizeHtml from 'sanitize-html'

export const createDevice = (params, labelId) => {
  return (dispatch) => {
    const deviceParams = sanitizeParams(params)

    rest.post('/api/devices', {
        device: deviceParams,
        label_id: labelId,
      })
      .then(response => {})
  }
}

export const updateDevice = (id, params) => {
  return (dispatch) => {
    const deviceParams = sanitizeParams(params)

    rest.put(`/api/devices/${id}`, {
      device: deviceParams
    })
    .then(response => {})
  }
}

export const deleteDevice = (id, redirect = true) => {
  return (dispatch) => {
    rest.destroy(`/api/devices/${id}`)
      .then(response => {
        if (redirect) dispatch(replace('/devices'))
      })
  }
}

export const deleteDevices = (devices) => {
  return (dispatch) => {
    rest.post(`/api/devices/delete`, {
      devices: devices.map(d => d.id)
    })
    .then(response => {})
  }
}

const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  if (params.dev_eui) params.dev_eui = sanitizeHtml(params.dev_eui)
  if (params.app_eui) params.app_eui = sanitizeHtml(params.app_eui)
  if (params.app_key) params.app_key = sanitizeHtml(params.app_key)
  return params
}
