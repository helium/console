import { push } from 'react-router-redux';
import * as rest from '../util/rest';
import { registrationError } from './errors.js'

export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const REGISTERED = 'REGISTERED';

export const logIn = (email, password) => {
  return (dispatch) => {
    rest.post('/api/sessions', {
        session: {
          email,
          password
        }
      })
      .then(response => response.json())
      .then(json => dispatch(loggedIn(json)))
      .catch(error => console.log('An error occured.', error))
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
      .then(response => response.json())
      .then(json => {
        if (json.errors) {
          const e = new Error()
          e.name = "Error Handled"
          e.message = json.errors[Object.keys(json.errors)[0]][0]
          throw e
        }
        return dispatch(registered(json))
      })
      .then(() => dispatch(push('/confirm_email')))
      .catch(error => {
        if (error.name === 'Error Handled') {
          dispatch(registrationError(error.message))
        } else {
          dispatch(registrationError('An unexpected error has occurred, please try again'))
        }
      })
  }
}

const loggedIn = (json) => {
  return {
    type: LOGGED_IN,
    apikey: json.jwt
  }
}

const loggedOut = () => {
  return {
    type: LOGGED_OUT
  }
}

const registered = (json) => {
  return {
    type: REGISTERED
  }
}
