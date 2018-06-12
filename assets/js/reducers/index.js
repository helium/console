import merge from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import union from 'lodash/union'
import auth from './auth';
import user from './user';
import { SWITCHED_TEAM } from '../actions/team'

const defaultEntityState = {
  teams: {}
}

const entities = (state = defaultEntityState, action) => {
  // Updates an entity cache in response to any action with entities.
  if (action.entities) {
    return merge({}, state, action.entities, (objValue, srcValue) => {
      if (isArray(objValue)) return union(objValue, srcValue) //NOTE does not deep compare objects
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
