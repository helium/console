import merge from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import union from 'lodash/union'
import omit from 'lodash/omit'
import auth from './auth';
import user from './user';
import { SWITCHED_TEAM, DELETED_TEAM } from '../actions/team'

const defaultEntityState = {
  teams: {}
}

const entities = (state = defaultEntityState, action) => {
  // Updates an entity cache in response to any action with entities.
  if (action.type === DELETED_TEAM) {
    const teams = omit(state.teams, [action.team.id])
    return merge({}, defaultEntityState, { teams })
  }

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
