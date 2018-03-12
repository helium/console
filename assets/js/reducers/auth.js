import { LOGGED_IN, LOGGED_OUT } from '../actions/auth.js';

const initialState = {
  isLoggedIn: false,
  apikey : null
}

const auth = (state = initialState, action) => {
  switch(action.type) {
    case LOGGED_IN:
      return { isLoggedIn: true, apikey: action.apikey };
    case LOGGED_OUT:
      return { isLoggedIn: false, apikey: null };
    default:
      return state;
  }
}

export default auth
