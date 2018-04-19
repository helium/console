import Noty from 'noty'

const timeouts = {}

const debounceMessage = (key, config) => {
  const clearKey = () => { delete timeouts[key] }
  if (timeouts[key]) return
  timeouts[key] = setTimeout(clearKey, 300)
  new Noty(config).show()
}

export const displayInfo = (msg) => {
  if (msg) {
    const config = {
      theme: 'mui',
      type: 'success',
      text: msg,
      timeout: 5000
    }

    debounceMessage(msg, config)
  }
}

export const displayError = (errorMsg) => {
  const config = {
    theme: 'mui',
    type: 'error',
    text: errorMsg || "An unexpected error has occurred, please try again",
    timeout: 5000
  }

  debounceMessage(msg, config)
}

