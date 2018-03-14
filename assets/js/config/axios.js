import axios from 'axios'
import Noty from 'noty'

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

const displayError = (errorMsg) => {
  const config = {
    theme: 'relax',
    type: 'error',
    text: errorMsg || "An unexpected error has occurred, please try again",
    timeout: 5000
  }

  new Noty(config).show()
}

export default axios
