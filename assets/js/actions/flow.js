import * as rest from '../util/rest';

export const updateFlows = (completeFlows, elementPositions) => {
  return rest.post(`/api/flows/update`, {
    completeFlows,
    elementPositions
  })
  .then(res => res.status)
}
