import * as rest from '../util/rest';

export const updateFlows = (completeFlows) => {
  return rest.post(`/api/flows/update`, {
    completeFlows
  })
  .then(res => res.status)
}
