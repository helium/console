import * as rest from '../util/rest';

export const updateEdges = (removeEdges, addEdges) => {
  rest.post(`/api/flows/update`, {
    removeEdges, addEdges
  })
  .then(() => {})
}
