import {
  LOGGED_IN,
  LOGGED_OUT,
  IS_VALID_USER,
  NEW_2FA_SECRET,
  CLEAR_TWO_FACTOR_BACKUP_CODES,
  REFRESHED_TOKEN
} from '../actions/auth.js';
import { SWITCHED_ORGANIZATION } from '../actions/organization.js';

const initialState = {
  isLoggedIn: false,
  apikey : null,
  user: null,
  currentOrganizationId: null,
  currentOrganizationName: null,
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
      return { ...state, isLoggedIn: true, apikey: action.apikey, currentOrganizationId: action.currentOrganizationId, currentOrganizationName: action.currentOrganizationName };
    case LOGGED_OUT:
      return { ...state, isLoggedIn: false, apikey: null, user: null, currentOrganizationId: null, currentOrganizationName: null };
    case REFRESHED_TOKEN:
    case SWITCHED_ORGANIZATION:
      return { ...state, currentOrganizationId: action.currentOrganizationId, currentOrganizationName: action.currentOrganizationName };
    default:
      return state;
  }
}

export default auth
