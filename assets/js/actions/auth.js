import { push } from 'react-router-redux';
import * as rest from '../util/rest';

export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const IS_VALID_USER = 'IS_VALID_USER';
export const REGISTERED = 'REGISTERED';
export const SENT_PASSWORD = 'SENT_PASSWORD';
export const RESET_PASSWORD = 'RESET_PASSWORD';
export const SENT_VERIFICATION = 'SENT_VERIFICATION';
export const SHOULD_RESET_CAPTCHA = "SHOULD_RESET_CAPTCHA";
export const HAS_RESET_CAPTCHA = "HAS_RESET_CAPTCHA";

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
        console.log(response)
        if (response.data.user.twoFactorEnabled === false) {
          dispatch(loggedIn(response.data.jwt))
          dispatch(push("/2fa_prompt"))
        } else {
          dispatch(isValidUser(response.data.user, response.data.jwt))
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

export const enable2fa = (code, userId, secret2fa) => {
  return (dispatch, getState) => {
    rest.post('/api/2fa', {
        user: {
          code,
          userId,
          secret2fa
        }
      })
      .then(response => {
        dispatch(logIn(getState().auth.apikey))
      })
  }
}

export const logIn = (apikey) => {
  return (dispatch) => {
    dispatch(loggedIn(apikey))
    dispatch(push('/secret'))
  }
}

export const logOut = () => {
  return (dispatch) => {
    dispatch(loggedOut())
  }
}

export const register = (teamName, email, password, passwordConfirm, recaptcha) => {
  return (dispatch) => {
    rest.post('/api/users', {
        recaptcha,
        user: {
          email,
          password,
          password_confirmation: passwordConfirm
        },
        team: {
          name: teamName
        }
      })
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

export const isValidUser = (user, jwt = null) => {
  return {
    type: IS_VALID_USER,
    user,
    apikey: jwt
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
    apikey
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
