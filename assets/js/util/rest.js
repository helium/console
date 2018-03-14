import { store } from '../store/configureStore';
import axios from 'axios'

export const get = (path) => (
  axios({
    url: path,
    method: 'get',
    headers: headers()
  })
)

export const post = (path, data) => (
  axios({
    url: path,
    method: 'post',
    headers: headers(),
    data
  })
)

const auth = () => (
  store.getState().auth
)

const isLoggedIn = () => (
  auth().isLoggedIn
)

const apikey = () => (
  auth().apikey
)

const headers = () => {
  let headerParams = {
    'Content-Type': 'application/json'
  };

  if (isLoggedIn()) {
    Object.assign(headerParams, {
      'Authorization': `Bearer ${apikey()}`
    })
  }

  return headerParams;
}
