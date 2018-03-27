import { RECEIVED_DEVICES, RECEIVED_NEW_DEVICE, RECEIVED_CURRENT_DEVICE } from '../actions/device.js';

const initialState = {
  index: [],
  current: null
}

const device = (state = initialState, action) => {
  switch(action.type) {
    case RECEIVED_DEVICES:
      return { ...state, index: action.devices };
    case RECEIVED_NEW_DEVICE:
      return { ...state, index: [...state.devices, action.device] };
    case RECEIVED_CURRENT_DEVICE:
      return { ...state, current: action.device };
    default:
      return state;
  }
}

export default device
