import { schema, normalize } from 'normalizr'

const membership = new schema.Entity('memberships')

export const membershipSchema = membership

export const normalizeMembership = (membershipData) => {
  const normalizedData = normalize(membershipData, membershipSchema)
  return normalizedData.entities
}

