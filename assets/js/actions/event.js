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
