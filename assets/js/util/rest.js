import { store } from "../store/configureStore";
import axios from "../config/axios.js";
import { displayError } from "./messages";
import { getIdTokenClaims } from "../components/auth/Auth0Provider";
import { getMagicSessionToken } from "../actions/magic"
import { logOut } from '../actions/auth'
import { config } from '../config/magic'

export const get = async (path, params = {}, extraHeaders = {}) => {
  return axios({
    url: path,
    method: "get",
    headers: Object.assign(await headers(), extraHeaders),
    params,
  });
};

export const post = async (path, data) => {
  return axios({
    url: path,
    method: "post",
    headers: await headers(),
    data,
  });
};

export const put = async (path, data) => {
  return axios({
    url: path,
    method: "put",
    headers: await headers(),
    data,
  });
};

export const destroy = async (path) => {
  return axios({
    url: path,
    method: "delete",
    headers: await headers(),
  });
};

const headers = async () => {
  let headerParams = {
    "Content-Type": "application/json",
  };
  let organizationId =
    store.getState().organization &&
    store.getState().organization.currentOrganizationId;

  if (!organizationId) {
    try {
      organizationId =
        localStorage.getItem("organization") &&
        JSON.parse(localStorage.getItem("organization")).id;
    } catch (e) {}
  }

  if (organizationId) {
    Object.assign(headerParams, { organization: organizationId });
  }

  let tokenClaims = store.getState().apollo.tokenClaims;

  if (config.useMagicAuth) {
    if (!tokenClaims) {
      tokenClaims = await getMagicSessionToken()
    } else if (Math.ceil(Date.now() / 1000) > tokenClaims.exp) {
      return store.dispatch(logOut());
    }
  } else {
    if (!tokenClaims) {
      tokenClaims = await getIdTokenClaims();
    } else if (Math.ceil(Date.now() / 1000) > tokenClaims.exp) {
      return store.dispatch(logOut());
    }
  }

  const apikey = tokenClaims.__raw;
  Object.assign(headerParams, {
    Authorization: `Bearer ${apikey}`,
  });

  return headerParams;
};
