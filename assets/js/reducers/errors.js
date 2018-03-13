import { REGISTRATION_ERROR } from '../actions/errors.js';

const initialState = {
  registration: null
}

const errors = (state = initialState, action) => {
  switch(action.type) {
    case REGISTRATION_ERROR:
      return Object.assign(state, { registration: action.message });
    default:
      return state;
  }
}

export default errors
