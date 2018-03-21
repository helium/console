import * as rest from '../util/rest';

export const FETCH_EVENTS = 'FETCH_EVENTS'
export const RECEIVED_EVENTS = 'RECEIVED_EVENTS'
export const RECEIVED_EVENT = 'RECEIVED_EVENT'

export const fetchEvents = () => {
  return (dispatch) => {
    rest.get('/api/events')
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
  return {
    type: RECEIVED_EVENT,
    event
  }
}
