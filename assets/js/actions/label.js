import * as rest from '../util/rest'
import { push, replace } from 'connected-react-router';
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

export const deleteLabels = (labels) => {
  return (dispatch) => {
    rest.post(`/api/labels/delete`, {
      labels: labels.map(l => l.id)
    })
    .then(response => {})
  }
}

//label show page add devices modal
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

//device index dropdown modal
export const addDevicesToLabel = (devices, toLabel) => {
  return (dispatch) => {
    let params = { to_label: toLabel };
    if (devices) {
      Object.assign(params, { devices });
    }
    rest.post(`/api/devices_labels`, params)
    .then(response => {})
  }
}

//device index dropdown modal
export const addDevicesToNewLabel = (devices, labelName) => {
  return (dispatch) => {
    let params = { new_label: labelName };
    if (devices) {
      Object.assign(params, { devices });
    }
    rest.post(`/api/devices_labels`, params)
    .then(response => {})
  }
}

export const removeDevicesFromLabel = (devices, label_id) => {
  return (dispatch) => {
    rest.post(`/api/devices_labels/delete`, {
      devices: devices.map(d => d.id),
      label_id,
    })
    .then(response => {})
  }
}

export const removeLabelsFromDevice = (labels, device_id) => {
  return (dispatch) => {
    rest.post(`/api/devices_labels/delete`, {
      labels: labels.map(l => l.id),
      device_id,
    })
    .then(response => {})
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
