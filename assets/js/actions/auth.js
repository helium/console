import { push } from 'react-router-redux';
import * as rest from '../util/rest';
import { getTeamId, getOrganizationId, getOrganizationName } from '../util/jwt'

export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const REFRESHED_TOKEN = 'REFRESHED_TOKEN';
export const IS_VALID_USER = 'IS_VALID_USER';
export const REGISTERED = 'REGISTERED';
export const SENT_PASSWORD = 'SENT_PASSWORD';
export const RESET_PASSWORD = 'RESET_PASSWORD';
export const SENT_VERIFICATION = 'SENT_VERIFICATION';
export const SHOULD_RESET_CAPTCHA = "SHOULD_RESET_CAPTCHA";
export const HAS_RESET_CAPTCHA = "HAS_RESET_CAPTCHA";
export const NEW_2FA_SECRET = "NEW_2FA_SECRET";
export const CLEAR_TWO_FACTOR_BACKUP_CODES = "CLEAR_TWO_FACTOR_BACKUP_CODES";

export const checkCredentials = (email, password, recaptcha) => {
  return (dispatch) => {
    rest.post('/api/sessions', {
        recaptcha,
        session: {
          email,
          password
        }
      })
      .then(response => {
        dispatch(isValidUser(response.data.user))
        if (!response.data.user.twoFactorEnabled) {
          dispatch(logIn(response.data.jwt))
          if (!response.data.skip2fa) {
            dispatch(push("/2fa_prompt"))
          }
        }
      })
      .catch(() => dispatch(shouldResetCaptcha()))
  }
}

export const verify2fa = (code, userId) => {
  return (dispatch) => {
    rest.post('/api/2fa/verify', {
        session: {
          code,
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
          code,
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
  return (dispatch) => {
    dispatch(loggedOut())
  }
}

export const register = (teamName, organizationName, email, password, passwordConfirm, recaptcha, invitationToken) => {
  let params = {
    recaptcha,
    user: {
      email,
      password,
      password_confirmation: passwordConfirm
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
      team: {
        name: teamName
      },
      organization: {
        name: organizationName
      }
    })
  }

  return (dispatch) => {
    rest.post('/api/users', params)
      .then(() => {
        return dispatch(registered())
      })
      .then(() => dispatch(push('/confirm_email')))
      .catch(() => dispatch(shouldResetCaptcha()))
  }
}

export const forgotPassword = (email, recaptcha) => {
  return (dispatch) => {
    rest.post('/api/users/forgot_password', {
        recaptcha,
        email
      })
      .then(response => {
        return dispatch(sentPassword())
      })
      .then(() => dispatch(push('/login')))
      .catch(() => dispatch(shouldResetCaptcha()))
  }
}

export const changePassword = (password, passwordConfirm, token) => {
  return (dispatch) => {
    rest.post('/api/users/change_password', {
        user: {
          token,
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

export const resendVerification = (email, recaptcha) => {
  return (dispatch) => {
    rest.post('/api/users/resend_verification', {
        recaptcha,
        email
      })
      .then(response => {
        return dispatch(sentVerification())
      })
      .then(() => dispatch(push('/login')))
      .catch(() => dispatch(shouldResetCaptcha()))
  }
}

export const refreshedToken = (apikey) => {
  return {
    type: REFRESHED_TOKEN,
    apikey,
    currentTeamId: getTeamId(apikey),
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

export const hasResetCaptcha = () => {
  return {
    type: HAS_RESET_CAPTCHA
  }
}

export const shouldResetCaptcha = () => {
  return {
    type: SHOULD_RESET_CAPTCHA
  }
}

const loggedIn = (apikey) => {
  return {
    type: LOGGED_IN,
    apikey,
    currentTeamId: getTeamId(apikey),
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
