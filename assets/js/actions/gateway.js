import * as rest from '../util/rest';
import { normalizeGateway, normalizeGateways } from '../schemas/gateway'

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
