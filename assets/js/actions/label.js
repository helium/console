import * as rest from '../util/rest'
import { push, replace } from 'connected-react-router';
import sanitizeHtml from 'sanitize-html'

export const createLabel = (name, channelId, redirect) => {
  return (dispatch) => {
    const labelParams = sanitizeParams({ name })

    rest.post('/api/labels', {
        label: labelParams,
        channel_id: channelId
      })
      .then(response => {
        if (redirect) dispatch(push(`/labels/${response.data.id}`))
      })
  }
}

export const updateLabel = (id, params) => {
  return (dispatch) => {
    const labelParams = sanitizeParams(params)

    rest.put(`/api/labels/${id}`, {
      label: labelParams
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

export const deleteLabels = (labels) => {
  return (dispatch) => {
    rest.post(`/api/labels/delete`, {
      labels: labels.map(l => l.id)
    })
    .then(response => {})
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

export const addDevicesToLabel = (devices, toLabel) => {
  return (dispatch) => {
    rest.post(`/api/devices_labels`, {
      devices,
      to_label: toLabel
    })
    .then(response => {})
  }
}

export const addDevicesToNewLabel = (devices, labelName) => {
  return (dispatch) => {
    rest.post(`/api/devices_labels`, {
      devices,
      new_label: sanitizeParams(labelName),
    })
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
    rest.post(`/api/devices_labels/delete`, {
      devices: devices.map(l => l.id),
    })
    .then(response => {})
  }
}

export const addLabelsToChannel = (labels, channel_id) => {
  return (dispatch) => {
    rest.post(`/api/channels_labels`, {
      labels,
      channel_id,
    })
    .then(response => {})
  }
}

export const removeLabelsFromChannel = (labels, channel_id) => {
  return (dispatch) => {
    rest.post(`/api/channels_labels/delete`, {
      labels,
      channel_id,
    })
    .then(response => {})
  }
}

const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  if (params.color) params.color = sanitizeHtml(params.color)
  return params
}
