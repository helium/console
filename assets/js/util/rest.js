import { store } from '../store/configureStore';
import axios from '../config/axios.js'
import { percentOfTimeLeft } from './jwt.js'
import { getIdTokenClaims } from '../components/auth/Auth0Provider'

export const get = async (path, params = {}, extraHeaders = {}) => {
  return axios({
    url: path,
    method: 'get',
    headers: Object.assign(await headers(), extraHeaders),
    params,
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

const headers = async () => {
  let headerParams = {
    'Content-Type': 'application/json'
  };
  let organizationId;
  try {
    organizationId = JSON.parse(localStorage.getItem('organization')).id;
  } catch (e) {
    // unable to retrieve the organization
  }
  if (organizationId) {
    Object.assign(headerParams, { organization: organizationId })
  }
  const tokenClaims = await getIdTokenClaims();
  const apikey = tokenClaims.__raw

  Object.assign(headerParams, {
    'Authorization': `Bearer ${apikey}`
  })

  return headerParams;
}
