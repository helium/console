import { push, replace } from 'connected-react-router';
import * as rest from '../util/rest';
import sanitizeHtml from 'sanitize-html'

export const FETCHING_APPLICATIONS = "FETCHING_APPLICATIONS";
export const FETCHED_APPLICATIONS = "FETCHED_APPLICATIONS";
export const FETCHING_APPLICATIONS_FAILED = "FETCHING_APPLICATIONS_FAILED";
export const IMPORT_STARTING = "IMPORT_STARTING";
export const IMPORT_STARTED = "IMPORT_STARTED";
export const IMPORT_FAILED = "IMPORT_FAILED";
export const GENERIC_IMPORT_SCANNED = "GENERIC_IMPORT_SCANNED";
export const GENERIC_IMPORT_SCAN_FAILED = "GENERIC_IMPORT_SCAN_FAILED";
export const GENERIC_IMPORT_STARTING = "GENERIC_IMPORT_STARTING";
export const GENERIC_IMPORT_STARTED = "GENERIC_IMPORT_STARTED";
export const GENERIC_IMPORT_FAILED = "GENERIC_IMPORT_FAILED";
export const RESET_GENERIC_IMPORT = "RESET_GENERIC_IMPORT";

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
    if (devices) {
      rest.post(`/api/devices/delete`, {
        devices: devices.map(d => d.id)
      })
      .then(response => {})
    } else {
      rest.post(`/api/devices/delete`)
      .then(response => {})
    }
  }
}

export const toggleDeviceDebug = (device_id) => {
  return (dispatch) => {
    rest.post(`/api/devices/debug`, {
      device: device_id
    })
    .then(response => {})
  }
}

export const fetchTtnDevices = (ttnCtlCode) => {
  return async (dispatch) => {
    dispatch(fetchingApplications());
    try {
      const response = await rest.get(
        `/api/ttn/devices`,
        null,
        { 'TTN-Ctl-Code': ttnCtlCode }
      );
      dispatch(fetchedApplications(response.data));
    } catch (e) {
      dispatch(fetchFailed());
    }
  }
}

export const importTtnDevices = (applications, account_token, add_labels, delete_devices, delete_apps) => {
  return async (dispatch) => {
    dispatch(startingDeviceImport());
    const response = await rest.post(
      '/api/ttn/devices/import',
      {applications, account_token, add_labels, delete_devices, delete_apps}
    );
    dispatch(startedDeviceImport());
  }
}

export const scanGenericDevices = (file, onComplete) => {
  return async (dispatch) => {
    function parseCSV(input) {
      let rows = input.split(/\r?\n/);
      const keys = [];
      rows.shift().split(",").forEach((val, index) => {
        if (['Name', 'name'].indexOf(val.toLowerCase()) > -1) {
          keys[index] = "name";
        } else if (['appkey', 'app_key'].indexOf(val.replace(/\s/g, '').toLowerCase()) > -1) {
          keys[index] = 'app_key';
        } else if (['appeui', 'app_eui'].indexOf(val.replace(/\s/g, '').toLowerCase()) > -1) {
          keys[index] = 'app_eui';
        } else if (['deveui', 'dev_eui'].indexOf(val.replace(/\s/g, '').toLowerCase()) > -1) {
          keys[index] = 'dev_eui';
        } else if (['labelid', 'label_id'].indexOf(val.replace(/\s/g, '').toLowerCase()) > -1) {
          keys[index] = 'label_id';
        } else if (['labelid2', 'label_id_2'].indexOf(val.replace(/\s/g, '').toLowerCase()) > -1) {
          keys[index] = 'label_id_2';
        }
      });
      let failed = false;
      ['name', 'app_key', 'app_eui', 'dev_eui'].forEach((key) => {
        if (keys.indexOf(key) < 0) {
          failed = true;
          dispatch({type: GENERIC_IMPORT_SCAN_FAILED});
          onComplete('');
        }
      })
      if (!failed) {
        rows = rows.filter((value) => value !== "");
        dispatch(scannedGenericDevicesImport(rows.map((row) => {
          return row.split(",").reduce((map, val, i) => {
            keys[i] && (map[keys[i]] = val);
            return map;
          }, {});
        })));
        onComplete('csv')
      }
    }
    parseCSV(file);
  }
}

export const resetGenericDeviceImport = (devices) => {
  return async (dispatch) => {
    dispatch({type: RESET_GENERIC_IMPORT});
  }
}

export const importGenericDevices = (devices, withLabel) => {
  return async (dispatch) => {
    dispatch({type: GENERIC_IMPORT_STARTING});
    await rest.post(
      '/api/generic/devices/import',
      {devices, add_labels: withLabel}
    )
    dispatch({type: GENERIC_IMPORT_STARTED});
  }
}

const fetchingApplications = () => ({ type: FETCHING_APPLICATIONS })

const fetchedApplications = (data) => {
  return {
    type: FETCHED_APPLICATIONS,
    ttnApplications: data.apps,
    ttnAuthCode: data.account_token
  }
}

const fetchFailed = () => ({ type: FETCHING_APPLICATIONS_FAILED })

const startingDeviceImport = () => ({ type: IMPORT_STARTING })

const startedDeviceImport = () => ({ type: IMPORT_STARTED })

const scannedGenericDevicesImport = (devices) => {
  return {
    type: GENERIC_IMPORT_SCANNED,
    devices
  }
}

const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  if (params.dev_eui) params.dev_eui = sanitizeHtml(params.dev_eui)
  if (params.app_eui) params.app_eui = sanitizeHtml(params.app_eui)
  if (params.app_key) params.app_key = sanitizeHtml(params.app_key)
  return params
}
