import { push } from 'react-router-redux';
import * as rest from '../util/rest';

export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const REGISTERED = 'REGISTERED';
export const SENT_PASSWORD = 'SENT_PASSWORD';
export const SENT_VERIFICATION = 'SENT_VERIFICATION';

export const logIn = (email, password) => {
  return (dispatch) => {
    rest.post('/api/sessions', {
        session: {
          email,
          password
        }
      })
      .then(response => {
        return dispatch(loggedIn(response.data.jwt))
      })
      .catch(() => {})
  }
}

export const logOut = () => {
  return (dispatch) => {
    dispatch(loggedOut())
  }
}

export const register = (email, password, passwordConfirm) => {
  return (dispatch) => {
    rest.post('/api/users', {
        user: {
          email,
          password,
          password_confirmation: passwordConfirm
        }
      })
      .then(() => {
        return dispatch(registered())
      })
      .then(() => dispatch(push('/confirm_email')))
      .catch(() => {})
  }
}

export const forgotPassword = (email) => {
  return (dispatch) => {
    rest.post('/api/users/forgot_password', {
        user: {
          email
        }
      })
      .then(response => {
        console.log(response)
        return dispatch(sentPassword())
      })
      .catch(() => {})
  }
}

export const resendVerification = (email) => {
  return (dispatch) => {
    rest.post('/api/users/resend_verification', {
        user: {
          email
        }
      })
      .then(response => {
        console.log(response)
        return dispatch(sentVerification())
      })
      .catch(() => {})
  }
}

const loggedIn = (jwt) => {
  return {
    type: LOGGED_IN,
    apikey: jwt
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

const sentVerification = () => {
  return {
    type: SENT_VERIFICATION
  }
}
