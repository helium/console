import * as rest from '../util/rest';

export const RECEIVE_USER = 'RECEIVE_USER';

export const fetchUser = () => {
  return (dispatch) => {
    rest.get('/api/users/current')
      .then(response => {
        dispatch(receiveUser(response.data))
      })
  };
}

const receiveUser = (user) => {
  return {
    type: RECEIVE_USER,
    email: user.email,
    role: user.role
  };
}
