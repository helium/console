import * as rest from '../util/rest';
import sanitizeHtml from 'sanitize-html'

export const inviteUser = (email, role, organization) => {
  return (dispatch) => {
    const invitation = {
      email: sanitizeHtml(email),
      role,
      organization
    }
    rest.post(`/api/invitations`, { invitation })
    .then(response => {})
  }
}

export const getInvitation = (token) => {
  return (dispatch) => {
    return rest.get(`/api/invitations/${token}`)
      .then(response => response.data)
  }
}

export const deleteInvitation = (invitation) => {
  return (dispatch) => {
    rest.destroy(`/api/invitations/${invitation.id}`)
      .then(response => {})
  }
}
