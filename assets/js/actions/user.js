import * as rest from '../util/rest';
import { replace } from 'connected-react-router';

export const RECEIVE_USER = 'RECEIVE_USER';

export const fetchUser = () => {
  return (dispatch) => {
    rest.get('/api/users/current')
      .then(response => {
        dispatch(receiveUser(response.data))
      })
      .catch(err => {
        localStorage.clear()
        dispatch(replace('/'))
      })
  };
}

const receiveUser = (user) => {
  return {
    type: RECEIVE_USER,
    email: user.email,
    role: user.role,
  };
}
