import {
  FETCHING_APPLICATIONS,
  FETCHED_APPLICATIONS,
  FETCHING_APPLICATIONS_FAILED,
  IMPORT_STARTING,
  IMPORT_STARTED,
  IMPORT_FAILED
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
      return { ...state, fetchingTtnApplications: true };
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
    
    default:
      return state;
  }
}

export default devices;