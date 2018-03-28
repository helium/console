import { schema, normalize } from 'normalizr'

const deviceProcessStrategy = (value, parent, key) => {
  return {...value, events: [parent.id]}
}

const device = new schema.Entity(
  'devices',
  {},
  {
    processStrategy: deviceProcessStrategy
  }
)

const event = new schema.Entity('events', {
  device
})

export const eventSchema = event

export const normalizeEvent = (eventData) => {
  const normalizedData = normalize(eventData, eventSchema)
  return normalizedData.entities
}
