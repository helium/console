import * as rest from '../util/rest';

export const updateMembership = (id, role) => {
  return (dispatch) => {
    rest.put(`/api/memberships/${id}`, {
      membership: {
        role
      }
    })
      .then(response => {})
  }
}

export const deleteMembership = (membership) => {
  return (dispatch) => {
    rest.destroy(`/api/memberships/${membership.id}`)
      .then(response => {})
  }
}
