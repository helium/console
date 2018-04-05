import { store } from '../store/configureStore';
import axios from '../config/axios.js'
import { percentOfTimeLeft } from './jwt.js'
import { refreshedToken } from '../actions/auth.js'
import { logOut } from '../actions/auth'

export const get = (path, params = {}) => {
  const originalApiCall = axios({
    url: path,
    method: 'get',
    headers: headers(),
    params
  })

  return checkTokenBeforeApiCall(originalApiCall)
}

export const post = (path, data) => {
  const originalApiCall = axios({
    url: path,
    method: 'post',
    headers: headers(),
    data
  })

  return checkTokenBeforeApiCall(originalApiCall)
}

export const destroy = (path) => {
  const originalApiCall = axios({
    url: path,
    method: 'delete',
    headers: headers()
  })

  return checkTokenBeforeApiCall(originalApiCall)
}

const checkTokenBeforeApiCall = (originalApiCall) => {
  const { apikey } = auth()

  if (shouldRefreshToken(apikey)) {
    return refreshTokenBeforeApiCall(apikey, originalApiCall)
  } else {
    return originalApiCall
  }
}

const refreshTokenBeforeApiCall = (apikey, originalApiCall) => (
  axios({
    url: 'api/sessions/refresh',
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

const shouldRefreshToken = (apikey) => {
  if (apikey !== null) {
    const percent = percentOfTimeLeft(apikey)
    return percent > 0 && percent < 0.1
  }
  return false
}
