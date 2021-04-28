import * as rest from '../util/rest';

export const createMultiBuy = (multiBuy) => {
  return (dispatch) => {

    return rest.post('/api/multi_buys', {
        multi_buy: multiBuy
      })
      .then(response => {})
  }
}

export const deleteMultiBuy = (id) => {
  return (dispatch) => {

    return rest.destroy(`/api/multi_buys/${id}`)
      .then(response => {})
  }
}

export const updateMultiBuy = (id, multiBuy) => {
  return (dispatch) => {

    return rest.put(`/api/multi_buys/${id}`, {
        multi_buy: multiBuy
      })
      .then(response => {})
  }
}

export const addMultiBuyToNode = (multiBuyId, nodeId, nodeType) => {
  return (dispatch) => {

    return rest.post(`/api/multi_buys/add_to_node`, {
        multi_buy_id: multiBuyId,
        node_id: nodeId,
        node_type: nodeType
      })
      .then(response => {})
  }
}

export const removeMultiBuyFromNode = (nodeId, nodeType) => {
  return (dispatch) => {

    return rest.post(`/api/multi_buys/remove_from_node`, {
        node_id: nodeId,
        node_type: nodeType
      })
      .then(response => {})
  }
}
