import { schema, normalize } from 'normalizr'
import * as rest from '../util/rest';

export const FETCH_EVENTS = 'FETCH_EVENTS'
export const RECEIVED_EVENTS = 'RECEIVED_EVENTS'
export const RECEIVED_EVENT = 'RECEIVED_EVENT'


export const fetchEvents = (scope = "all", id = null) => {
  return (dispatch) => {
    const params = {}
    if (scope !== "all") params[`${scope}_id`] = id

    rest.get('/api/events', params)
      .then(response => {
        return dispatch(receivedEvents(response.data.data)) // TODO why data 2x?
      })
  }
}

export const receivedEvents = (events) => {
  return {
    type: RECEIVED_EVENTS,
    events
  }
}

export const receivedEvent = (event) => {
  const deviceProcessStrategy = (value, parent, key) => {
    console.log(value)
    console.log(parent)
    console.log(key)
    return {...value, events: [parent.id]}
  }
  const deviceEntity = new schema.Entity(
    'devices',
    {},
    {
      processStrategy: deviceProcessStrategy
    }
  )
  const eventEntity = new schema.Entity('events', {
    device: deviceEntity
  })
  const eventSchema = eventEntity
  const normalizedData = normalize(event, eventSchema)
  console.log(normalizedData)
  const entities = normalizedData.entities

  return {
    type: RECEIVED_EVENT,
    entities
  }
}
