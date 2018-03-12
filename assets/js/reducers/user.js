import { RECEIVE_USER } from '../actions/user.js';
import { LOGGED_OUT } from '../actions/auth.js';

const initialState = {
  email: null
}

const user = (state = initialState, action) => {
  switch(action.type) {
    case RECEIVE_USER:
      return { ...state, email: action.email };
    case LOGGED_OUT:
      return { ...state, email: null };
    default:
      return state;
  }
}

export default user
