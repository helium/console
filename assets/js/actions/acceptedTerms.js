import * as rest from '../util/rest';

export const SET_ACCEPTED_TERMS = 'SET_ACCEPTED_TERMS';

export const createAcceptedTerm = (email) => {
  return rest.post('/api/terms', {
    email
  })
  .then(response => {
    window.location.replace("/");
  });
}

export const fetchAcceptedTerm = (email) => {
  return rest.get('/api/terms', {
    email
  })
}

export const setAcceptedTermsTrue = () => {
  return {
    type: SET_ACCEPTED_TERMS,
  };
}
