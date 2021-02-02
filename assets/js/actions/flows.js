import * as rest from '../util/rest';

export const updateEdges = (removeEdges, addEdges) => {
  return rest.post(`/api/flows/update`, {
    removeEdges, addEdges
  })
  .then(res => res.status)
}
