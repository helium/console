import {
  FETCHING_APPLICATIONS,
  FETCHED_APPLICATIONS,
  FETCHING_APPLICATIONS_FAILED,
  IMPORT_STARTING,
  IMPORT_STARTED,
  IMPORT_FAILED,
  GENERIC_IMPORT_SCANNED,
  GENERIC_IMPORT_SCAN_FAILED,
  GENERIC_IMPORT_STARTING,
  GENERIC_IMPORT_STARTED,
  RESET_GENERIC_IMPORT
} from '../actions/device';

const initialState = {
  fetchedTtnApplications: false,
  fetchingTtnApplications: false,
  ttnApplications: [],
  ttnAuthorizationCode: null,
  importingDevices: false,
  importedDevices: false
}

const devices = (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_APPLICATIONS:
      return { ...state, fetchingTtnApplications: true, importStarted: false };
    case FETCHED_APPLICATIONS:
      return { 
        ...state,
        fetchedTtnApplications: true,
        fetchingTtnApplications: false,
        ttnApplications: action.ttnApplications,
        ttnAuthorizationCode: action.ttnAuthCode
      };
    case FETCHING_APPLICATIONS_FAILED:
      return {
        ...state,
        fetchedTtnApplications: false,
        fetchingTtnApplications: false
      }
    case IMPORT_STARTING:
      return { ...state, importStarting: true, importStarted: false };
    case IMPORT_STARTED:
      return {
        ...state,
        importStarted: true,
        importStarting: false,
        fetchedTtnApplications: false,
        fetchingTtnApplications: false,
        ttnApplications: null,
        ttnAuthorizationCode: null
      };
    case IMPORT_FAILED:
      return {
        ...state,
        importStarting: false,
        importStarted: false,
        ttnApplications: null,
        ttnAuthorizationCode: null,
        fetchedTtnApplications: false,
        fetchingTtnApplications: false
      }
    case GENERIC_IMPORT_SCANNED:
      return {
        ...state,
        importStarted: false,
        genericImportScanned: true,
        genericImportScanFailed: false,
        scannedGenericDevices: action.devices,
      }
    case GENERIC_IMPORT_SCAN_FAILED:
      return {
        ...state,
        importStarted: false,
        genericImportScanFailed: true
      }
    case GENERIC_IMPORT_STARTING:
      return {
        ...state,
        genericImportScanned: false
      }
    case GENERIC_IMPORT_STARTED:
      return {
        ...state,
        scannedGenericDevices: null,
        importStarted: true
      }
    case RESET_GENERIC_IMPORT:
      return {
        ...state,
        genericImportScanned: false,
        genericImportScanFailed: false,
        scannedGenericDevices: null
      }
    default:
      return state;
  }
}

export default devices;