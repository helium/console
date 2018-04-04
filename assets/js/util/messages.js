import Noty from 'noty'

export const displayInfo = (msg) => {
  if (msg) {
    const config = {
      theme: 'relax',
      type: 'success',
      text: msg,
      timeout: 5000
    }

    new Noty(config).show()
  }
}

export const displayError = (errorMsg) => {
  const config = {
    theme: 'relax',
    type: 'error',
    text: errorMsg || "An unexpected error has occurred, please try again",
    timeout: 5000
  }

  new Noty(config).show()
}

