import * as rest from '../util/rest';

export const RECEIVE_USER = 'RECEIVE_USER';

export const fetchUser = () => {
  return (dispatch) => {
    rest.get('/api/secret')
      .then(response => {
        dispatch(receiveUser(response.data.your_email))
      })
  };
}

const receiveUser = (email) => {
  return {
    type: RECEIVE_USER,
    email
  };
}
