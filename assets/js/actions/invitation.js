import * as rest from '../util/rest';

export const inviteUser = (invitation) => {
  return (dispatch) => {
    rest.post(`/api/invitations`, { invitation })
    .then(response => {})
  }
}

export const deleteInvitation = (invitation) => {
  return (dispatch) => {
    rest.destroy(`/api/invitations/${invitation.id}`)
      .then(response => {})
  }
}
