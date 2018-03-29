import { schema, normalize } from 'normalizr'

const event = new schema.Entity('events')

const gateway = new schema.Entity('gateways', {
  events: [ event ]
})

export const gatewaysSchema = [gateway]
export const gatewaySchema = gateway

export const normalizeGateways = (gatewaysData) => {
  return normalize(gatewaysData, gatewaysSchema).entities
}

export const normalizeGateway = (gatewayData) => {
  return normalize(gatewayData, gatewaySchema).entities
}

