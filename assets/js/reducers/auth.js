import { LOGGED_IN, LOGGED_OUT, CLEAR_CAPTCHA_STATUS, RESET_CAPTCHA } from '../actions/auth.js';

const initialState = {
  isLoggedIn: false,
  apikey : null,
  resetCaptcha: false
}

const auth = (state = initialState, action) => {
  switch(action.type) {
    case LOGGED_IN:
      return { isLoggedIn: true, apikey: action.apikey, resetCaptcha: state.resetCaptcha };
    case LOGGED_OUT:
      return { isLoggedIn: false, apikey: null, resetCaptcha: state.resetCaptcha };
    case CLEAR_CAPTCHA_STATUS:
      return { isLoggedIn: state.isLoggedIn, apikey: state.apikey, resetCaptcha: false };
    case RESET_CAPTCHA:
      return { isLoggedIn: state.isLoggedIn, apikey: state.apikey, resetCaptcha: true};
    default:
      return state;
  }
}

export default auth
