import { schema, normalize } from 'normalizr'

const membership = new schema.Entity('memberships')

export const membershipsSchema = [membership]
export const membershipSchema = membership

export const normalizeMemberships = (membershipsData) => {
  return normalize(membershipsData, membershipsSchema).entities
}

export const normalizeMembership = (membershipData) => {
  return normalize(membershipData, membershipSchema).entities
}

