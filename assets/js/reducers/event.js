import { RECEIVED_EVENTS, RECEIVED_EVENT } from '../actions/event.js';

const initialState = {
  current: []
}

const event = (state = initialState, action) => {
  switch(action.type) {
    case RECEIVED_EVENTS:
      return { current: action.events };
    case RECEIVED_EVENT:
      return { current: [...state.current, action.event] };
    default:
      return state;
  }
}

export default event
