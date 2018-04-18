import * as rest from '../util/rest';
import { normalizeMembership } from '../schemas/membership'
import { DELETED_ENTITY } from './main'
import { displayInfo } from '../util/messages'

export const RECEIVED_MEMBERSHIP = 'RECEIVED_MEMBERSHIP'

export const receivedMembership = (membership) => {
  const entities = normalizeMembership(membership)

  return {
    type: RECEIVED_MEMBERSHIP,
    entities
  }
}

export const deleteMembership = (membership) => {
  return (dispatch) => {
    rest.destroy(`/api/memberships/${membership.id}`)
      .then(response => {
        dispatch(deletedMembership(membership))
        displayInfo(`Membership removed successfully`)
      })
  }
}

export const deletedMembership = (membership) => {
  return {
    type: DELETED_ENTITY,
    entity: 'memberships',
    id: membership.id
  }
}
