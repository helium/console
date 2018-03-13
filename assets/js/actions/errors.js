export const REGISTRATION_ERROR = 'REGISTRATION_ERROR'

export const registrationError = (message) => {
  return {
    type: REGISTRATION_ERROR,
    message
  }
}
