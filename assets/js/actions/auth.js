import * as rest from '../util/rest';
import { logout } from '../components/auth/Auth0Provider';
import { logoutUser } from './magic'
import analyticsLogger from '../util/analyticsLogger';
import { config } from '../config/magic'

export const SET_MAGIC_USER = 'SET_MAGIC_USER';
export const CLEAR_MAGIC_USER = 'CLEAR_MAGIC_USER';

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
  window.Intercom('shutdown')

  return async (dispatch) => {
    localStorage.removeItem("organization");
    if (config.useMagicAuth) {
      await logoutUser()
      dispatch(clearMagicUser())
      window.location.replace("/")
    } else {
      await logout({returnTo: window.location.origin});
    }
  }
}

export const subscribeNewUser = (email) => {
  return (dispatch) => {
    rest.post(`/api/subscribe_new_user`, { email })
    .then(() => {})
  }
}

export const magicLogIn = (user) => {
  return {
    type: SET_MAGIC_USER,
    payload: user
  }
}

export const clearMagicUser = () => {
  return {
    type: CLEAR_MAGIC_USER,
  }
}
