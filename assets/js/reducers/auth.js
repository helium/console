import { LOGGED_IN, LOGGED_OUT, HAS_RESET_CAPTCHA, SHOULD_RESET_CAPTCHA, IS_VALID_USER } from '../actions/auth.js';

const initialState = {
  isLoggedIn: false,
  apikey : null,
  shouldResetCaptcha: false,
  user: null,
}

const auth = (state = initialState, action) => {
  switch(action.type) {
    case IS_VALID_USER:
      return { ...state, apikey: action.apikey, user: action.user };
    case LOGGED_IN:
      const user = { id: state.user.id, twoFactorEnabled: state.user.twoFactorEnabled };
      return { ...state, isLoggedIn: true, apikey: action.apikey, user };
    case LOGGED_OUT:
      return { ...state, isLoggedIn: false, apikey: null, user: null };
    case HAS_RESET_CAPTCHA:
      return { ...state, shouldResetCaptcha: false };
    case SHOULD_RESET_CAPTCHA:
      return { ...state, shouldResetCaptcha: true };
    default:
      return state;
  }
}

export default auth
