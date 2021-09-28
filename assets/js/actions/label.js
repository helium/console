import * as rest from '../util/rest'
import { replace } from 'connected-react-router';
import sanitizeHtml from 'sanitize-html'

export const createLabel = (label) => {
  return (dispatch) => {
    const labelParams = sanitizeParams(label)

    return rest.post('/api/labels', {
        label: labelParams
      })
      .then(response => {})
  }
}

export const updateLabel = (id, params) => {
  return (dispatch) => {
    const labelParams = sanitizeParams(params)

    return rest.put(`/api/labels/${id}`, {
      label: labelParams
    })
    .then(response => {})
  }
}

export const deleteLabel = (id, redirect = true) => {
  return (dispatch) => {
    return rest.destroy(`/api/labels/${id}`)
      .then(response => {
        if (redirect) dispatch(replace('/devices'))
        return response
      })
  }
}

//label show page add devices modal
export const addDevicesToLabels = (devices, labels, toLabel) => {
  return (dispatch) => {
    return rest.post(`/api/devices_labels`, {
      devices: Object.keys(devices),
      labels: Object.keys(labels),
      to_label: toLabel
    })
  }
}

//device index dropdown modal
export const addDevicesToLabel = (devices, toLabel) => {
  return (dispatch) => {
    let params = { to_label: toLabel };
    if (devices) {
      Object.assign(params, { devices });
    }
    return rest.post(`/api/devices_labels`, params)
  }
}

//device index dropdown modal
export const addDevicesToNewLabel = (devices, labelName) => {
  return (dispatch) => {
    let params = { new_label: labelName };
    if (devices) {
      Object.assign(params, { devices });
    }
    return rest.post(`/api/devices_labels`, params)
  }
}

export const removeDevicesFromLabel = (devices, label_id) => {
  return (dispatch) => {
    return rest.post(`/api/devices_labels/delete`, {
      devices: devices.map(d => d.id),
      label_id,
    })
  }
}

export const removeLabelsFromDevice = (labels, device_id) => {
  return (dispatch) => {
    return rest.post(`/api/devices_labels/delete`, {
      labels: labels.map(l => l.id),
      device_id,
    })
  }
}

export const removeAllLabelsFromDevices = (devices) => {
  return (dispatch) => {
    if (devices) {
      rest.post(`/api/devices_labels/delete`, {
        devices: devices.map(l => l.id),
      })
      .then(response => {})
    } else {
      rest.post(`/api/devices_labels/delete`).then(response => {})
    }
  }
}

const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  if (params.color) params.color = sanitizeHtml(params.color)
  return params
}
