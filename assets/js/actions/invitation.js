import * as rest from '../util/rest';
import { normalizeInvitation, normalizeInvitations  } from '../schemas/invitation'
import { DELETED_ENTITY } from './main'
import { displayInfo } from '../util/messages'

export const RECEIVED_INVITATIONS = 'RECEIVED_INVITATIONS'
export const RECEIVED_INVITATION = 'RECEIVED_INVITATION'
export const UPDATED_INVITATION = 'UPDATED_INVITATION'

export const fetchInvitations = () => {
  return (dispatch) => {
    rest.get('/api/invitations')
      .then(response => {
        return dispatch(receivedInvitations(response.data))
      })
  }
}

export const receivedInvitations = (invitations) => {
  const entities = normalizeInvitations(invitations)

  return {
    type: RECEIVED_INVITATIONS,
    entities
  }
}

export const receivedInvitation = (invitation) => {
  const entities = normalizeInvitation(invitation)

  return {
    type: RECEIVED_INVITATION,
    entities
  }
}

export const updatedInvitation = (invitation) => {
  const entities = normalizeInvitation(invitation)

  return {
    type: UPDATED_INVITATION,
    entities
  }
}

export const deleteInvitation = (invitation) => {
  return (dispatch) => {
    rest.destroy(`/api/invitations/${invitation.id}`)
      .then(response => {
        displayInfo(`Invitation removed successfully`)
      })
  }
}

export const deletedInvitation = (invitation) => {
  return {
    type: DELETED_ENTITY,
    entity: 'invitations',
    id: invitation.id
  }
}
