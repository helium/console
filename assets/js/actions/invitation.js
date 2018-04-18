import { normalizeInvitation } from '../schemas/invitation'

export const RECEIVED_INVITATION = 'RECEIVED_INVITATION'

export const receivedInvitation = (invitation) => {
  const entities = normalizeInvitation(invitation)

  return {
    type: RECEIVED_INVITATION,
    entities
  }
}

