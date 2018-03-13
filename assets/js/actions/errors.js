export const REGISTRATION_ERROR = 'REGISTRATION_ERROR'
export const CLEAR_ERROR = 'CLEAR_ERROR'

export const registrationError = (message) => {
  return {
    type: REGISTRATION_ERROR,
    message
  }
}

export const clearError = () => {
  return {
    type: CLEAR_ERROR
  }
}
