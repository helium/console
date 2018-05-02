import * as rest from '../util/rest';
import { DELETED_ENTITY } from './main'
import { normalizeEvent } from '../schemas/event'

export const RECEIVED_EVENT = 'RECEIVED_EVENT'


export const receivedEvent = (event) => {
  const entities = normalizeEvent(event)

  return {
    type: RECEIVED_EVENT,
    entities
  }
}

export const createEvent = (eventParams) => {
  return (dispatch) => {
    rest.post('/api/events', {
        event: eventParams
      })
      .then(response => {})
  }
}

export const deleteEvent = (event) => {
  return (dispatch) => {
    rest.destroy(`/api/events/${event.id}`)
      .then(response => {})
  }
}

export const deletedEvent = (event) => {
  return {
    type: DELETED_ENTITY,
    entity: 'events',
    id: event.id
  }
}
