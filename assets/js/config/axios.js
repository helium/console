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
    if (response.data && response.data.status === "success") displayInfo(response.data.action)
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

const displayInfo = (msg) => {
  let text = ""

  if (msg === "resend_verification") text = "Your verification email has been resent, please check your email"
  else if (msg === "forgot_password") text = "Your password reset email has been sent, please check your email"
  else if (msg === "change_password") text = "Your password has been changed successfully, please login with your new credentials"

  if (text.length > 0) {
    const config = {
      theme: 'relax',
      type: 'success',
      text,
      timeout: 5000
    }

    new Noty(config).show()
  }
}

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
