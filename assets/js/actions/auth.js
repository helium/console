import * as rest from '../util/rest';
import { logout } from '../components/auth/Auth0Provider';
import { logoutUser } from './magic'
import analyticsLogger from '../util/analyticsLogger';

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
    if (true) {
      localStorage.removeItem("organization");
      await logoutUser()
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
