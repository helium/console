import { push, replace } from 'connected-react-router';
import * as rest from '../util/rest';
import sanitizeHtml from 'sanitize-html'

export const FETCHING_APPLICATIONS = "FETCHING_APPLICATIONS";
export const FETCHED_APPLICATIONS = "FETCHED_APPLICATIONS";
export const FETCHING_APPLICATIONS_FAILED = "FETCHING_APPLICATIONS_FAILED";
export const IMPORT_STARTING = "IMPORT_STARTING";
export const IMPORT_STARTED = "IMPORT_STARTED";
export const IMPORT_FAILED = "IMPORT_FAILED";
export const GENERIC_IMPORT_SCANNING = "GENERIC_IMPORT_SCANNING";
export const GENERIC_IMPORT_SCANNED = "GENERIC_IMPORT_SCANNED";
export const GENERIC_IMPORT_STARTING = "GENERIC_IMPORT_STARTING";
export const GENERIC_IMPORT_STARTED = "GENERIC_IMPORT_STARTED";
export const GENERIC_IMPORT_FAILED = "GENERIC_IMPORT_FAILED";

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

export const importTtnDevices = (applications, account_token, add_labels, delete_devices) => {
  return async (dispatch) => {
    dispatch(startingDeviceImport());
    const response = await rest.post(
      '/api/ttn/devices/import',
      {applications, account_token, add_labels, delete_devices}
    );
    dispatch(startedDeviceImport());
  }
}

export const scanGenericDevices = (file, fileName) => {
  return async (dispatch) => {
    dispatch({type: GENERIC_IMPORT_SCANNING});
    function parseCSV(input) {
      let rows = input.split(/\r?\n/);
      const keys = [];
      rows.shift().split(",").forEach((val, index) => {
        if (['Name', 'name'].indexOf(val) > -1) {
          keys[index] = "name";
        } else if (['AppKey', 'App Key', 'app_key'].indexOf(val) > -1) {
          keys[index] = 'app_key';
        } else if (['AppEUI', 'App EUI', 'app_eui'].indexOf(val) > -1) {
          keys[index] = 'app_eui';
        } else if (['DevEUI', 'Dev EUI', 'dev_eui'].indexOf(val) > -1) {
          keys[index] = 'dev_eui';
        } else if (['Label ID', 'LabelID', 'label_id'].indexOf(val) > -1) {
          keys[index] = 'label_id';
        }
      });
      rows = rows.filter((value) => value !== "");
      return rows.map((row) => {
        return row.split(",").reduce((map, val, i) => {
          keys[i] && (map[keys[i]] = val);
          return map;
        }, {});
      });
    }
    dispatch(scannedGenericDevicesImport(parseCSV(file), fileName));
  }
}

export const importGenericDevices = (devices, labelName) => {
  return async (dispatch) => {
    dispatch({type: GENERIC_IMPORT_STARTING});
    await rest.post(
      '/api/generic/devices/import',
      {devices, label_id: labelName}
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

const scannedGenericDevicesImport = (devices, fileName) => {
  return {
    type: GENERIC_IMPORT_SCANNED,
    devices,
    fileName
  }
}

const failedDeviceImport = () => ({ type: IMPORT_FAILED })


const sanitizeParams = (params) => {
  if (params.name) params.name = sanitizeHtml(params.name)
  if (params.dev_eui) params.dev_eui = sanitizeHtml(params.dev_eui)
  if (params.app_eui) params.app_eui = sanitizeHtml(params.app_eui)
  if (params.app_key) params.app_key = sanitizeHtml(params.app_key)
  return params
}
