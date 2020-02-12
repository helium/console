import * as rest from '../util/rest'
import { push, replace } from 'connected-react-router';

export const createLabel = (name, redirect) => {
  return (dispatch) => {
    rest.post('/api/labels', {
        label: {
          name
        },
      })
      .then(response => {
        if (redirect) dispatch(push(`/labels/${response.data.id}`))
      })
  }
}

export const updateLabel = (id, params) => {
  return (dispatch) => {
    rest.put(`/api/labels/${id}`, {
      label: params
    })
    .then(response => {})
  }
}

export const deleteLabel = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/labels/${id}`)
      .then(response => {
        dispatch(replace('/labels'))
      })
  }
}

export const addDevicesToLabels = (devices, labels, toLabel) => {
  return (dispatch) => {
    rest.post(`/api/devices_labels`, {
      devices: Object.keys(devices),
      labels: Object.keys(labels),
      to_label: toLabel
    })
    .then(response => {})
  }
}

export const removeDeviceFromLabel = (device_id, label_id) => {
  return (dispatch) => {
    rest.destroy(`/api/devices_labels?device_id=${device_id}&label_id=${label_id}`)
    .then(response => {})
  }
}
