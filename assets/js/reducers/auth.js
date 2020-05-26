import {
  LOGGED_OUT,
  FETCHED_MFA_ENROLLMENT
} from '../actions/auth.js';
import { SWITCHED_ORGANIZATION } from '../actions/organization.js';

const initialState = {
  currentOrganizationId: null,
  currentOrganizationName: null,
  mfaEnrollmentStatus: false
}

const auth = (state = initialState, action) => {
  switch(action.type) {
    case LOGGED_OUT:
      return { ...state, currentOrganizationId: null, currentOrganizationName: null };
    case SWITCHED_ORGANIZATION:
      return { ...state, currentOrganizationId: action.currentOrganizationId, currentOrganizationName: action.currentOrganizationName };
    case FETCHED_MFA_ENROLLMENT:
      return { ...state, mfaEnrollmentStatus: action.mfaEnrollmentStatus}
    default:
      return state;
  }
}

export default auth
