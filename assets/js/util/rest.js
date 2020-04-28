import { store } from '../store/configureStore';
import axios from '../config/axios.js'
import { percentOfTimeLeft } from './jwt.js'
import { refreshedToken } from '../actions/auth.js'
import { getIdTokenClaims } from '../components/auth/Auth0Provider'

export const get = async (path, params = {}) => {
  return axios({
    url: path,
    method: 'get',
    headers: await headers(),
    params
  })
}

export const post = async (path, data) => {
  return axios({
    url: path,
    method: 'post',
    headers: await headers(),
    data
  })
}

export const put = async (path, data) => {
  return axios({
    url: path,
    method: 'put',
    headers: await headers(),
    data
  })
}

export const destroy = async (path) => {
  return axios({
    url: path,
    method: 'delete',
    headers: await headers()
  })
}

const checkTokenBeforeApiCall = (originalApiCall) => {
  const { apikey } = auth()

  if (shouldRefreshToken(apikey)) {
    return refreshTokenBeforeApiCall(apikey, originalApiCall)
  } else {
    return originalApiCall
  }
}

const refreshTokenBeforeApiCall = async (apikey, originalApiCall) => {

  axios({
    url: '/api/sessions/refresh',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apikey}`
    },
    data: {
      jwt: apikey
    }
  })
  .then(response => {
    store.dispatch(refreshedToken(response.data.jwt))
    return originalApiCall
  })
}

const headers = async () => {
  let headerParams = {
    'Content-Type': 'application/json'
  };
  // how to do this
  const tokenClaims = await getIdTokenClaims();
  const apikey = tokenClaims.__raw

  Object.assign(headerParams, {
    'Authorization': `Bearer ${apikey}`
  })

  return headerParams;
}

const shouldRefreshToken = (apikey) => {
  if (apikey !== null) {
    const percent = percentOfTimeLeft(apikey)
    return percent > 0 && percent < 0.1
  }
  return false
}
