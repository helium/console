import merge from 'lodash/merge'
import auth from './auth.js';
import user from './user.js';

// Updates an entity cache in response to any action with entities.
const entities = (state = { devices: {}, events: {} }, action) => {
  if (action.entities) {
    return merge({}, state, action.entities)
  }

  return state
}

const reducers = {
  entities,
  auth,
  user,
};

export default reducers;
