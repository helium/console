import {
  LOGGED_IN,
  LOGGED_OUT,
  HAS_RESET_CAPTCHA,
  SHOULD_RESET_CAPTCHA,
  IS_VALID_USER,
  NEW_2FA_SECRET,
  CLEAR_TWO_FACTOR_BACKUP_CODES,
  REFRESHED_TOKEN
} from '../actions/auth.js';

import { SWITCHED_TEAM } from '../actions/team.js';

const initialState = {
  isLoggedIn: false,
  apikey : null,
  shouldResetCaptcha: false,
  user: null,
  currentTeamId: null
}

const auth = (state = initialState, action) => {
  switch(action.type) {
    case IS_VALID_USER:
      return { ...state, user: action.user };
    case NEW_2FA_SECRET:
      const newUser = { ...state.user, secret2fa: action.secret2fa }
      return { ...state, user: newUser };
    case CLEAR_TWO_FACTOR_BACKUP_CODES:
      const updatedUser = { id: state.user.id, twoFactorEnabled: state.user.twoFactorEnabled }
      return { ...state, user: updatedUser };
    case LOGGED_IN:
      return { ...state, isLoggedIn: true, apikey: action.apikey, currentTeamId: action.currentTeamId };
    case LOGGED_OUT:
      return { ...state, isLoggedIn: false, apikey: null, user: null, currentTeamId: null };
    case REFRESHED_TOKEN:
      return { ...state, apikey: action.apikey, currentTeamId: action.currentTeamId };
    case HAS_RESET_CAPTCHA:
      return { ...state, shouldResetCaptcha: false };
    case SHOULD_RESET_CAPTCHA:
      return { ...state, shouldResetCaptcha: true };
    case SWITCHED_TEAM:
      return { ...state, apikey: action.apikey, currentTeamId: action.currentTeamId };
    default:
      return state;
  }
}

export default auth
