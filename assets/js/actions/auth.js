import * as rest from '../util/rest';
import { logout } from '../components/auth/Auth0Provider';
import analyticsLogger from '../util/analyticsLogger';

export const LOGGED_OUT = 'LOGGED_OUT';

export const getMfaStatus = () => {
  return (dispatch) => {
    return rest.get('/api/mfa_enrollments');
  }
}

export const enrollInMfa = () => {
  return (dispatch) => {
    return rest.post('/api/mfa_enrollments');
  }
}

export const disableMfa = () => {
  return (dispatch) => {
    return rest.destroy('/api/mfa_enrollments');
  }
}

export const logOut = () => {
  analyticsLogger.setUserId(null)
  return async (dispatch) => {
    await logout({returnTo: window.location.origin});
    dispatch(loggedOut())
  }
}

export const subscribeNewUser = (email) => {
  return (dispatch) => {
    rest.post(`/api/subscribe_new_user`, { email })
    .then(() => {})
  }
}

const loggedOut = () => {
  return {
    type: LOGGED_OUT
  }
}
