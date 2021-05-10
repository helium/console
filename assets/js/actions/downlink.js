import * as rest from '../util/rest';
import { displayInfo, displayError } from '../util/messages';

export const sendDownlinkMessage = (payload, port, confirmed, position, type, id) => {
  return (dispatch) => {
    rest.post(
      `/api/downlink?type=${type}&id=${id}`,
      { payload_raw: payload, port, confirmed, position, from: 'console_downlink_queue' }
    )
    .then(() => {displayInfo(`Successfully queued downlink for ${type}`)})
    .catch(() => {displayError(`Failed to queue downlink for ${type}`)})
  }
}

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
