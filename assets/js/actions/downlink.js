import * as rest from '../util/rest';

export const sendClearDownlinkQueue = (payload) => {
  return (dispatch) => {
    rest.post(
      '/api/clear_downlink_queue',
      payload
    );
  }
}

export const fetchDownlinkQueue = (id, type) => {
  return (dispatch) => {
    rest.get(`/api/downlink_queue?type=${type}&id=${id}`)
  }
}
