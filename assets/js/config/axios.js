import axios from 'axios'
import { displayInfo, displayError } from '../util/messages'
import { logOut } from '../actions/auth'
import { store } from '../store/configureStore'

axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    displayError()
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    if (response.status >= 200 && response.status < 300 &&
      response.data && response.data.success_message !== undefined) displayInfo(response.data.success_message)

    if (response.status >= 200 && response.status < 300 &&
      response.headers.message !== undefined) displayInfo(response.headers.message)

    return response
  },
  error => {
    if (error.response.status === 401 && error.response.data.message === "invalid_token") {
      displayError("Your token has expired, please log in again to access your account")
      store.dispatch(logOut())
    } else if (error.response.status !== 500 && error.response.data.errors) {
      Object.keys(error.response.data.errors).forEach(key => {
        displayError(error.response.data.errors[key])
      })
    } else {
      displayError()
    }

    if (error.response.data.type === "forbidden_organization") {
      store.dispatch(logOut())
    }

    return Promise.reject(error);
  }
)

export default axios
