import merge from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import auth from './auth.js';
import user from './user.js';

const defaultEntityState = {
  devices: {},
  events: {},
  gateways: {},
  channels: {}
}

// Updates an entity cache in response to any action with entities.
const entities = (state = defaultEntityState, action) => {
  if (action.entities) {
    return merge({}, state, action.entities, (objValue, srcValue) => {
      if (isArray(objValue)) return objValue.concat(srcValue) // merge arrays
    })
  }

  return state
}

const reducers = {
  entities,
  auth,
  user,
};

export default reducers;
