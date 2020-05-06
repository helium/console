import { push } from 'connected-react-router';
import sanitizeHtml from 'sanitize-html'
import * as rest from '../util/rest';
import { getOrganizationId, getOrganizationName } from '../util/jwt';
import { logIn } from './auth'

export const FETCHED_ORGANIZATION = 'FETCHED_ORGANIZATIONS'
export const FETCHING_ORGANIZATION = 'FETCHING_ORGANIZATION'
export const SWITCHED_ORGANIZATION = 'SWITCHED_ORGANIZATION'

export const fetchOrganization = () => {
  return async (dispatch) => {
    dispatch(fetchingOrganization());
    let organization;
    try {
      organization = JSON.parse(localStorage.getItem('organization'));
    } catch (e) {
      organization = null;
    }
    if (!organization) {
      // get a new organization id
      const organizations = await getOrganizations();
      if (organizations && organizations.length) {
        localStorage.setItem('organization', JSON.stringify(organizations[0]));
        return dispatch(fetchedOrganization(organizations[0]));
      }
    } else {
      // validate or replace organization id
      const fetchedOrganizations = await getOrganizations();
      if (fetchedOrganizations.indexOf(organization)) {
        return dispatch(fetchedOrganization(organization));
      } else if (fetchedOrganizations && fetchedOrganizations.length){
        localStorage.setItem('organization', JSON.stringify(fetchedOrganizations[0]));
        return dispatch(fetchedOrganization(fetchedOrganizations[0]));
      }
    }
    return dispatch(fetchedOrganization({ id: null, name: "" }))
  }
}

export const createOrganization = (name, noOtherOrg = false) => {
  return (dispatch) => {
    rest.post('/api/organizations', {
        organization: {
          name: sanitizeHtml(name)
        },
      })
      .then(response => {
        if (noOtherOrg) {
          dispatch(fetchedOrganization(response));
          window.location.reload(true);
        }
      })
  }
}

export const switchOrganization = (organization) => {
  return (dispatch) => {
    localStorage.setItem('organization', JSON.stringify(organization));
    dispatch(switchedOrganization(organization));
    window.location.reload(true);
  }
}

export const joinOrganization = (token) => {
  let params = { invitation: { token } }
  return async dispatch => {
    rest.post('/api/users', params)
      .then(response => {
        dispatch(fetchedOrganization(response.data[0]));
        localStorage.setItem('organization', JSON.stringify(response.data[0]));
        push('/devices');
      })
  }
}

export const deleteOrganization = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/organizations/${id}`)
      .then(response => {})
  }
}

export const fetchingOrganization = () => {
  return {
    type: FETCHING_ORGANIZATION
  }
}

export const fetchedOrganization = (organization) => {
  return {
    type: FETCHED_ORGANIZATION,
    currentOrganizationId: organization.id,
    currentOrganizationName: organization.name
  }
}

export const switchedOrganization = (organization) => {
  return {
    type: SWITCHED_ORGANIZATION,
    currentOrganizationId: organization.id,
    currentOrganizationName: organization.name
  }
}

const getOrganizations = async () => {
  const organizations = await rest.get('/api/organizations/');
  return organizations.data;
}
