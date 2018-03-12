import * as rest from '../util/rest';

export const RECEIVE_USER = 'RECEIVE_USER';

export const fetchUser = () => {
  return (dispatch) => {
    rest.get('/api/secret')
      .then(response => response.json())
      .then(json => dispatch(receiveUser(json)))
      .catch(error => console.log('An error occured.', error))
  };
}

const receiveUser = (json) => {
  return {
    type: RECEIVE_USER,
    email: json.your_email
  };
}
