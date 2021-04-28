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
