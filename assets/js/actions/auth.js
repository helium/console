import { push } from 'connected-react-router';
import * as rest from '../util/rest';
import { getOrganizationId, getOrganizationName } from '../util/jwt'
import analyticsLogger from '../util/analyticsLogger'
import sanitizeHtml from 'sanitize-html'

export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const REFRESHED_TOKEN = 'REFRESHED_TOKEN';
export const IS_VALID_USER = 'IS_VALID_USER';
export const REGISTERED = 'REGISTERED';
export const SENT_PASSWORD = 'SENT_PASSWORD';
export const RESET_PASSWORD = 'RESET_PASSWORD';
export const SENT_VERIFICATION = 'SENT_VERIFICATION';
export const NEW_2FA_SECRET = "NEW_2FA_SECRET";
export const CLEAR_TWO_FACTOR_BACKUP_CODES = "CLEAR_TWO_FACTOR_BACKUP_CODES";

export const checkCredentials = (email, password) => {
  return (dispatch) => {
    rest.post('/api/sessions', {
        session: {
          email: sanitizeHtml(email),
          password
        }
      })
      .then(response => {
        analyticsLogger.setUserId(response.data.user.id)
        dispatch(isValidUser(response.data.user))
        if (!response.data.user.twoFactorEnabled) {
          dispatch(logIn(response.data.jwt))
          if (!response.data.skip2fa) {
            dispatch(push("/2fa_prompt"))
          }
        }
      })
  }
}

export const verify2fa = (code, userId) => {
  return (dispatch) => {
    rest.post('/api/2fa/verify', {
        session: {
          code: sanitizeHtml(code),
          userId
        }
      })
      .then(response => {
        dispatch(logIn(response.data.jwt))
      })
  }
}

export const getNew2fa = () => {
  return (dispatch) => {
    rest.get('/api/2fa')
      .then(response => {
        dispatch(new2faSecret(response.data.secret2fa))
      })
  }
}

export const enable2fa = (code, userId, secret2fa) => {
  return (dispatch) => {
    rest.post('/api/2fa', {
        user: {
          code: sanitizeHtml(code),
          userId,
          secret2fa
        }
      })
      .then(response => {
        dispatch(isValidUser(response.data.user))
      })
  }
}

export const skip2fa = (userId) => {
  return (dispatch) => {
    rest.post('/api/2fa/skip', {
        userId
      })
      .then(() => {})
  }
}

export const logIn = (apikey) => {
  return (dispatch) => {
    dispatch(loggedIn(apikey))
  }
}

export const logOut = () => {
  analyticsLogger.setUserId(null)
  return (dispatch) => {
    dispatch(loggedOut())
  }
}

export const register = (organizationName, email, password, invitationToken) => {
  let params = {
    user: {
      email: sanitizeHtml(email),
      password,
    }
  }

  if (invitationToken !== undefined) {
    params = Object.assign(params, {
      invitation: {
        token: invitationToken
      }
    })
  } else {
    params = Object.assign(params, {
      organization: {
        name: sanitizeHtml(organizationName)
      }
    })
  }

  return (dispatch) => {
    rest.post('/api/users', params)
      .then(() => {
        return dispatch(registered())
      })
      .then(() => dispatch(push('/confirm_email')))
  }
}

export const forgotPassword = (email) => {
  return (dispatch) => {
    rest.post('/api/users/forgot_password', {
        email: sanitizeHtml(email)
      })
      .then(response => {
        return dispatch(sentPassword())
      })
      .then(() => dispatch(push('/login')))
  }
}

export const changePassword = (password, passwordConfirm, token) => {
  return (dispatch) => {
    rest.post('/api/users/change_password', {
        user: {
          token: sanitizeHtml(token),
          password,
          password_confirmation: passwordConfirm
        }
      })
      .then(response => {
        return dispatch(resetPassword())
      })
      .then(() => dispatch(push('/login')))
  }
}

export const resendVerification = (email) => {
  return (dispatch) => {
    rest.post('/api/users/resend_verification', {
        email: sanitizeHtml(email)
      })
      .then(response => {
        return dispatch(sentVerification())
      })
      .then(() => dispatch(push('/login')))
  }
}

export const refreshedToken = (apikey) => {
  return {
    type: REFRESHED_TOKEN,
    apikey,
    currentOrganizationId: getOrganizationId(apikey),
    currentOrganizationName: getOrganizationName(apikey)
  }
}

export const isValidUser = (user, jwt = null) => {
  return {
    type: IS_VALID_USER,
    user,
    apikey: jwt
  }
}

export const clear2faBackupCodes = () => {
  return {
    type: CLEAR_TWO_FACTOR_BACKUP_CODES
  }
}

export const new2faSecret = (secret) => {
  return {
    type: NEW_2FA_SECRET,
    secret2fa: secret
  }
}

const loggedIn = (apikey) => {
  return {
    type: LOGGED_IN,
    apikey,
    currentOrganizationId: getOrganizationId(apikey),
    currentOrganizationName: getOrganizationName(apikey)
  }
}

const loggedOut = () => {
  return {
    type: LOGGED_OUT
  }
}

const registered = () => {
  return {
    type: REGISTERED
  }
}

const sentPassword = () => {
  return {
    type: SENT_PASSWORD
  }
}

const resetPassword = () => {
  return {
    type: RESET_PASSWORD
  }
}

const sentVerification = () => {
  return {
    type: SENT_VERIFICATION
  }
}
