import { store } from '../store/configureStore';
import axios from '../config/axios.js'

export const get = (path, params = {}) => (
  axios({
    url: path,
    method: 'get',
    headers: headers(),
    params
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

export const destroy = (path) => (
  axios({
    url: path,
    method: 'delete',
    headers: headers()
  })
)

const auth = () => (
  store.getState().auth
)

const headers = () => {
  let headerParams = {
    'Content-Type': 'application/json'
  };
  const {isLoggedIn, apikey} = auth()

  if (isLoggedIn) {
    Object.assign(headerParams, {
      'Authorization': `Bearer ${apikey}`
    })
  }

  return headerParams;
}
