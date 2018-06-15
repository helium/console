import { push, replace } from 'react-router-redux';
import * as rest from '../util/rest';

export const createGateway = (params, redirect = false) => {
  return (dispatch) => {
    rest.post('/api/gateways', {
        gateway: params
      })
      .then(response => {
        const { id } = response.data
        if (redirect) dispatch(replace(`/gateways/${id}`))
      })
  }
}

export const deleteGateway = (id, redirect = false) => {
  return (dispatch) => {
    rest.destroy(`/api/gateways/${id}`)
      .then(response => {
        if (redirect) dispatch(replace('/gateways'))
      })
  }
}
