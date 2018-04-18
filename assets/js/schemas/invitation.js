import { schema, normalize } from 'normalizr'

const invitation = new schema.Entity('invitations')

export const invitationSchema = invitation

export const normalizeInvitation = (invitationData) => {
  const normalizedData = normalize(invitationData, invitationSchema)
  return normalizedData.entities
}

