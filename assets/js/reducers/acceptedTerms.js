import { SET_ACCEPTED_TERMS } from '../actions/acceptedTerms'

const initialState = false

const acceptedTerms = (state = initialState, action) => {
    switch(action.type) {
      case SET_ACCEPTED_TERMS:
        return true;
      default:
        return state;
    }
}

export default acceptedTerms;
