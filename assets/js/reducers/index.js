import merge from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import auth from './auth.js';
import user from './user.js';
import { SWITCHED_TEAM } from '../actions/team'

const defaultEntityState = {
  devices: {},
  events: {},
  gateways: {},
  channels: {},
  teams: {},
}

const entities = (state = defaultEntityState, action) => {
  // Updates an entity cache in response to any action with entities.
  if (action.entities) {
    return merge({}, state, action.entities, (objValue, srcValue) => {
      if (isArray(objValue)) return objValue.concat(srcValue) // merge arrays
    })
  }

  // Clears entity cache upon switching teams
  if (action.type === SWITCHED_TEAM) {
    return merge({}, defaultEntityState, {teams: state.teams})
  }

  return state
}

const reducers = {
  entities,
  auth,
  user,
};

export default reducers;
