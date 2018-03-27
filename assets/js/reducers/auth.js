import { LOGGED_IN, LOGGED_OUT, HAS_RESET_CAPTCHA, SHOULD_RESET_CAPTCHA } from '../actions/auth.js';

const initialState = {
  isLoggedIn: false,
  apikey : null,
  shouldResetCaptcha: false
}

const auth = (state = initialState, action) => {
  switch(action.type) {
    case LOGGED_IN:
      return { ...state, isLoggedIn: true, apikey: action.apikey };
    case LOGGED_OUT:
      return { ...state, isLoggedIn: false, apikey: null };
    case HAS_RESET_CAPTCHA:
      return { ...state, shouldResetCaptcha: false };
    case SHOULD_RESET_CAPTCHA:
      return { ...state, shouldResetCaptcha: true };
    default:
      return state;
  }
}

export default auth
