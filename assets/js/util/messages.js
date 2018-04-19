import Noty from 'noty'

const timeouts = {}

const makeKey = (config) => {
  // use a base-64 encoded, stringified version of the config to craft a key
  return btoa(JSON.stringify(config))
}

const debounceMessage = (config) => {
  const key = makeKey(config)
  if (timeouts[key]) return
  timeouts[key] = setTimeout(() => { delete timeouts[key]}, 300)
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

    debounceMessage(config)
  }
}

export const displayError = (errorMsg) => {
  const config = {
    theme: 'mui',
    type: 'error',
    text: errorMsg || "An unexpected error has occurred, please try again",
    timeout: 5000
  }

  debounceMessage(config)
}

