import merge from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import auth from './auth.js';
import user from './user.js';

const customMerger = (objValue, srcValue) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

// Updates an entity cache in response to any action with entities.
const entities = (state = { devices: {}, events: {} }, action) => {
  if (action.entities) {
    return merge({}, state, action.entities, customMerger)
  }

  return state
}

const reducers = {
  entities,
  auth,
  user,
};

export default reducers;
