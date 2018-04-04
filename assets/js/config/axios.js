import axios from 'axios'
import { displayInfo, displayError } from '../util/messages'

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
    return response
  },
  error => {
    if (error.response.status !== 500 && error.response.data.errors) {
      Object.keys(error.response.data.errors).forEach(key => {
        displayError(error.response.data.errors[key])
      })
    } else {
      displayError()
    }
    return Promise.reject(error);
  }
)

export default axios
