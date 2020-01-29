import merge from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import union from 'lodash/union'
import omit from 'lodash/omit'
import auth from './auth';
import user from './user';

const defaultEntityState = {
}

const entities = (state = defaultEntityState, action) => {
  if (action.entities) {
    return merge({}, state, action.entities, (objValue, srcValue) => {
      if (isArray(objValue)) return union(objValue, srcValue) //NOTE does not deep compare objects
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
