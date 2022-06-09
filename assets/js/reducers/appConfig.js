let initialState = { useDefaults: true }

try {
  initialState = require('../../../config/app-config.json')
} catch (err) {}

const appConfig = (state = initialState, _action) => {
  return state
}

export default appConfig;
