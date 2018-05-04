import * as rest from '../util/rest';
import { normalizeMembership, normalizeMemberships  } from '../schemas/membership'
import { DELETED_ENTITY } from './main'

export const RECEIVED_MEMBERSHIPS = 'RECEIVED_MEMBERSHIPS'
export const RECEIVED_MEMBERSHIP = 'RECEIVED_MEMBERSHIP'
export const UPDATED_MEMBERSHIP = 'UPDATED_MEMBERSHIP'

export const fetchMemberships = () => {
  return (dispatch) => {
    rest.get('/api/memberships')
      .then(response => {
        return dispatch(receivedMemberships(response.data))
      })
  }
}

export const receivedMemberships = (memberships) => {
  const entities = normalizeMemberships(memberships)

  return {
    type: RECEIVED_MEMBERSHIPS,
    entities
  }
}

export const receivedMembership = (membership) => {
  const entities = normalizeMembership(membership)

  return {
    type: RECEIVED_MEMBERSHIP,
    entities
  }
}

export const updateMembership = (id, role) => {
  return (dispatch) => {
    rest.put(`/api/memberships/${id}`, {
      membership: {
        role
      }
    })
      .then(response => {})
  }
}

export const updatedMembership = (membership) => {
  const entities = normalizeMembership(membership)

  return {
    type: UPDATED_MEMBERSHIP,
    entities
  }
}

export const deleteMembership = (membership) => {
  return (dispatch) => {
    rest.destroy(`/api/memberships/${membership.id}`)
      .then(response => {})
  }
}

export const deletedMembership = (membership) => {
  return {
    type: DELETED_ENTITY,
    entity: 'memberships',
    id: membership.id
  }
}
