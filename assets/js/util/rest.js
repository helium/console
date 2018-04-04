import { store } from '../store/configureStore';
import axios from '../config/axios.js'
import { getTimeToExpiration } from './jwt.js'
import { refreshToken } from '../actions/auth.js'
import { logOut } from '../actions/auth'

export const get = (path, params = {}) => {
  const { apikey } = auth()
  const originalApiCall = axios({
    url: path,
    method: 'get',
    headers: headers(),
    params
  })

  if (shouldRefreshToken(apikey)) {
    return refreshTokenBeforeApiCall(apikey, originalApiCall)
  } else {
    return originalApiCall
  }
}

export const post = (path, data) => {
  const { apikey } = auth()
  const originalApiCall = axios({
    url: path,
    method: 'post',
    headers: headers(),
    data
  })

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
    store.dispatch(refreshToken(response.data.jwt))
    return originalApiCall
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

const shouldRefreshToken = (apikey) => {
  if (apikey !== null) {
    const timeToExpiration = getTimeToExpiration(apikey)
    return (timeToExpiration < 3600 && timeToExpiration > 0) // How long before refreshing token, currently at 1 hour
  }
  return false
}
