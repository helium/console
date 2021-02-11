import * as rest from '../util/rest'
import { push, replace } from 'connected-react-router';
import sanitizeHtml from 'sanitize-html'

export const createLabel = (label, redirect) => {
  return (dispatch) => {
    const labelParams = sanitizeParams(label)

    rest.post('/api/labels', {
        label: labelParams
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
    let params = { to_label: toLabel };
    if (devices) {
      Object.assign(params, { devices });
    }
    rest.post(`/api/devices_labels`, params)
    .then(response => {})
  }
}

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

export const removeAllDevicesFromLabels = (labels) => {
  return (dispatch) => {
    rest.post(`/api/devices_labels/delete`, {
      labels: labels.map(l => l.id),
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

export const addChannelToLabel = (label_id, channel_id) => {
  return (dispatch) => {
    rest.post(`/api/channels_labels`, {
      label_id,
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

export const removeChannelFromLabel = (label_id, channel_id) => {
  return (dispatch) => {
    rest.post(`/api/channels_labels/delete`, {
      label_id,
      channel_id,
    })
    .then(response => {})
  }
}

export const removeLabelFromFunction = (label_id, function_id) => {
  return (dispatch) => {
    rest.post(`/api/labels/remove_function`, {
      label: label_id,
      function: function_id,
    })
    .then(response => {})
  }
}

export const toggleLabelDebug = (label_id) => {
  return (dispatch) => {
    rest.post(`/api/labels/debug`, {
      label: label_id
    })
    .then(response => {})
  }
}

export const swapLabel = (label_id, destination_label_id) => {
  return (dispatch) => {
    rest.post(`/api/labels/swap_label`, {
      label_id,
      destination_label_id,
    })
    .then(response => {})
  }
}

export const updateLabelNotificationSettings = (settings) => {
  return (dispatch) => {
    rest.post(`/api/labels/update_notification_settings`, {
      label_notification_settings: settings
    })
  }
}

export const updateLabelNotificationWebhooks = (webhooks) => {
  return (dispatch) => {
    rest.post(`/api/labels/update_notification_webhooks`, {
      label_notification_webhooks: webhooks
    })
  }
}

const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  if (params.color) params.color = sanitizeHtml(params.color)
  return params
}
