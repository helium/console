import * as rest from '../util/rest';
import { normalizeInvitation } from '../schemas/invitation'
import { DELETED_ENTITY } from './main'
import { displayInfo } from '../util/messages'

export const RECEIVED_INVITATION = 'RECEIVED_INVITATION'

export const receivedInvitation = (invitation) => {
  const entities = normalizeInvitation(invitation)

  return {
    type: RECEIVED_INVITATION,
    entities
  }
}

export const deleteInvitation = (invitation) => {
  return (dispatch) => {
    rest.destroy(`/api/invitations/${invitation.id}`)
      .then(response => {
        dispatch(deletedInvitation(invitation))
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
