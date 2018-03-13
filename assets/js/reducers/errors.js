import { REGISTRATION_ERROR, CLEAR_ERROR } from '../actions/errors.js';

const initialState = {
  registration: null
}

const errors = (state = initialState, action) => {
  switch(action.type) {
    case REGISTRATION_ERROR:
      return { registration: action.message };
    case CLEAR_ERROR:
      return { registration: null };
    default:
      return state;
  }
}

export default errors
