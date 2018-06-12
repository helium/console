import * as rest from '../util/rest';

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
