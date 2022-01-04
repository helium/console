import { UPDATE_DISPLAY_SETTING } from '../actions/display'

const initialState = {
  desktopOnly: false
}

const display = (state = initialState, action) => {
    switch(action.type) {
      case UPDATE_DISPLAY_SETTING:
        return {
          desktopOnly: action.desktopOnly
        };
      default:
        return state;
    }
}

export default display;
