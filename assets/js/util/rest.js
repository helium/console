import { store } from '../store/configureStore';

export const get = (path) => (
  fetch(path, {
    headers: headers()
  })
)

export const post = (path, body) => (
  fetch(path, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body)
  })
)

const auth = () => (
  store.getState().auth
)

const isLoggedIn = () => (
  auth().isLoggedIn
)

const apikey = () => (
  auth().apikey
)

const headers = () => {
  let headerParams = {
    'Content-Type': 'application/json'
  };

  if (isLoggedIn()) {
    Object.assign(headerParams, {
      'Authorization': `Bearer ${apikey()}`
    })
  }

  return new Headers(headerParams);
}

