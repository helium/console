import * as rest from '../util/rest';
import { normalizeEvent } from '../schemas/event'

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
  const entities = normalizeEvent(event)

  return {
    type: RECEIVED_EVENT,
    entities
  }
}
