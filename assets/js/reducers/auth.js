import { LOGGED_IN, LOGGED_OUT, HAS_RESET_CAPTCHA, SHOULD_RESET_CAPTCHA } from '../actions/auth.js';

const initialState = {
  isLoggedIn: false,
  apikey : null,
  shouldResetCaptcha: false
}

const auth = (state = initialState, action) => {
  switch(action.type) {
    case LOGGED_IN:
      return { isLoggedIn: true, apikey: action.apikey, shouldResetCaptcha: state.shouldResetCaptcha };
    case LOGGED_OUT:
      return { isLoggedIn: false, apikey: null, shouldResetCaptcha: state.shouldResetCaptcha };
    case HAS_RESET_CAPTCHA:
      return { isLoggedIn: state.isLoggedIn, apikey: state.apikey, shouldResetCaptcha: false };
    case SHOULD_RESET_CAPTCHA:
      return { isLoggedIn: state.isLoggedIn, apikey: state.apikey, shouldResetCaptcha: true };
    default:
      return state;
  }
}

export default auth
