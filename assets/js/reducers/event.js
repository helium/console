import { RECEIVED_EVENTS, RECEIVED_EVENT } from '../actions/event.js';

const initialState = {
  events: []
}

const event = (state = initialState, action) => {
  switch(action.type) {
    case RECEIVED_EVENTS:
      return { events: action.events };
    case RECEIVED_EVENT:
      return { events: [...state.events, action.event] };
    default:
      return state;
  }
}

export default event
