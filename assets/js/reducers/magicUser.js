import { SET_MAGIC_USER, CLEAR_MAGIC_USER } from '../actions/auth.js';

const initialState = { isLoggedIn: null, email: '', sub: '' }

const magicUser = (state = initialState, action) => {
  switch(action.type) {
    case SET_MAGIC_USER:
      return action.payload
    case CLEAR_MAGIC_USER:
      return { isLoggedIn: null, email: '', sub: '' }
    default:
      return state
  }
}

export default magicUser
