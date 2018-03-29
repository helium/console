import { schema, normalize } from 'normalizr'

const parentProcessStrategy = (value, parent, key) => {
  return {...value, events: [parent.id]}
}

const device = new schema.Entity(
  'devices',
  {},
  {
    processStrategy: parentProcessStrategy
  }
)

const gateway = new schema.Entity(
  'gateways',
  {},
  {
    processStrategy: parentProcessStrategy
  }
)

const event = new schema.Entity('events', {
  device,
  gateway
})

export const eventSchema = event

export const normalizeEvent = (eventData) => {
  const normalizedData = normalize(eventData, eventSchema)
  return normalizedData.entities
}
