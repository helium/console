import { normalizeMembership } from '../schemas/membership'

export const RECEIVED_MEMBERSHIP = 'RECEIVED_MEMBERSHIP'

export const receivedMembership = (membership) => {
  const entities = normalizeMembership(membership)

  return {
    type: RECEIVED_MEMBERSHIP,
    entities
  }
}

