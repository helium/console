import { push, replace } from 'react-router-redux';
import * as rest from '../util/rest';
import { normalizeGateway, normalizeGateways } from '../schemas/gateway'
import { DELETED_ENTITY } from './main'
import { displayInfo } from '../util/messages'

export const FETCH_GATEWAYS = 'FETCH_GATEWAYS'
export const RECEIVED_GATEWAYS = 'RECEIVED_GATEWAYS'
export const FETCH_GATEWAY = 'FETCH_GATEWAY'
export const RECEIVED_GATEWAY = 'RECEIVED_GATEWAY'


export const fetchGateways = () => {
  return (dispatch) => {
    rest.get('/api/gateways')
      .then(response => {
        return dispatch(receivedGateways(response.data))
      })
  }
}

export const receivedGateways = (gateways) => {
  const entities = normalizeGateways(gateways)

  return {
    type: RECEIVED_GATEWAYS,
    entities
  }
}

export const fetchGateway = (id) => {
  return (dispatch) => {
    rest.get(`/api/gateways/${id}`)
      .then(response => {
        return dispatch(receivedGateway(response.data))
      })
  }
}

export const receivedGateway = (gateway) => {
  const entities = normalizeGateway(gateway)

  return {
    type: RECEIVED_GATEWAY,
    entities
  }
}

export const createGateway = (params) => {
  return (dispatch) => {
    rest.post('/api/gateways', {
        gateway: params
      })
      .then(response => {})
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

export const deletedGateway = (gateway) => {
  return {
    type: DELETED_ENTITY,
    entity: 'gateways',
    id: gateway.id
  }
}
