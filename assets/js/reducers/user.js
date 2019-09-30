import { RECEIVE_USER } from '../actions/user.js';
import { LOGGED_OUT } from '../actions/auth.js';

const initialState = {
  email: null,
  role: null,
  inOrganization: false,
}

const user = (state = initialState, action) => {
  switch(action.type) {
    case RECEIVE_USER:
      return { ...state, email: action.email, role: action.role, inOrganization: action.inOrganization };
    case LOGGED_OUT:
      return { ...state, email: null, role: null, inOrganization: false };
    default:
      return state;
  }
}

export default user
