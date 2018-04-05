import * as rest from '../util/rest';
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
      .then(response => {
        return dispatch(receivedEvent(response.data))
      })
  }
}
