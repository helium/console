import { push } from 'connected-react-router';
import * as rest from '../util/rest';
import { getOrganizationId, getOrganizationName } from '../util/jwt';

export const createOrganization = (name, getToken) => {
  return (dispatch) => {
    rest.post('/api/organizations', {
        organization: {
          name
        },
      })
      .then(response => {})
  }
}

export const switchOrganization = (id) => {
  return (dispatch) => {
    rest.post(`/api/organizations/${id}/switch_org`)
      .then(response => {
        window.location.reload(true)
      })
  }
}

export const deleteOrganization = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/organizations/${id}`)
      .then(response => {
      })
  }
}

export const inviteUser = (invitation) => {
  return (dispatch) => {
    rest.post(`/api/invitations`, { invitation })
    .then(response => {})
  }
}
