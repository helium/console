import amplitude from 'amplitude-js'

let analyticsLogger = {
  setUserId: () => {},
  logEvent: () => {}
}

// if (!process.env.SELF_HOSTED) {
//   analyticsLogger = amplitude.getInstance()
//   analyticsLogger.init('2b23c37c10c54590bf3f2ba705df0be6')
//   analyticsLogger.setUserProperties({ hostname: window.location.hostname })
// }

export default analyticsLogger
