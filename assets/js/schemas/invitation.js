import { schema, normalize } from 'normalizr'

const invitation = new schema.Entity('invitations')

export const invitationsSchema = [invitation]
export const invitationSchema = invitation

export const normalizeInvitations = (invitationsData) => {
  return normalize(invitationsData, invitationsSchema).entities
}

export const normalizeInvitation = (invitationData) => {
  return normalize(invitationData, invitationSchema).entities
}

