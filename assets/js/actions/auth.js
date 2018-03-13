import { push } from 'react-router-redux';
import * as rest from '../util/rest';

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
        console.log(json)
        return dispatch(loggedIn(json))
      })
      .then(() => dispatch(push('/confirm_email')))
      .catch(error => console.log('An error occured.', error))
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
