import { push } from 'connected-react-router';
import * as rest from '../util/rest';
import { logout } from '../components/auth/Auth0Provider';
import analyticsLogger from '../util/analyticsLogger';

export const LOGGED_OUT = 'LOGGED_OUT';
export const FETCHED_MFA_ENROLLMENT = "FETCHED_MFA_ENROLLMENT";

export const getMfaStatus = () => {
  return  async (dispatch) => {
    var response = await rest.get('/api/mfa_enrollments');
    dispatch(fetchedMfaStatus(response.data.enrollment_status));
  }
}

export const logOut = () => {
  analyticsLogger.setUserId(null)
  return async (dispatch) => {
    await logout({returnTo: window.location.origin});
    dispatch(loggedOut())
  }
}

export const fetchedMfaStatus = (status) => {
  return {
    type: FETCHED_MFA_ENROLLMENT,
    mfaEnrollmentStatus: status
  }
}

const loggedOut = () => {
  return {
    type: LOGGED_OUT
  }
}
