import { push } from 'connected-react-router';
import sanitizeHtml from 'sanitize-html'
import * as rest from '../util/rest';
import { getOrganizationId, getOrganizationName } from '../util/jwt';
import { logIn } from './auth'

export const FETCHED_ORGANIZATION = 'FETCHED_ORGANIZATIONS'
export const SWITCHED_ORGANIZATION = 'SWITCHED_ORGANIZATION'

export const fetchOrganization = () => {
  return async (dispatch) => {
    let organization;
    try {
      organization = JSON.parse(localStorage.getItem('organization'));
    } catch (e) {
      organization = null;
    }
    if (!organization) {
      // get a new organization id
      const organizations = await getMembership();
      dispatch(fetchedOrganization(organizations[0]));
      localStorage.setItem('organization', JSON.stringify(organizations[0]));
    } else {
      // validate or replace organization id
      const fetchedOrganizations = await getMembership();
      if (fetchedOrganizations.indexOf(organization)) {
        dispatch(fetchedOrganization(organization));
      } else {
        dispatch(fetchedOrganization(fetchedOrganizations[0]));
        localStorage.setItem('organization', JSON.stringify(fetchedOrganizations[0]));
      }
    }
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
          dispatch(logIn(response.data.jwt))
          window.location.reload(true)
        }
      })
  }
}

export const switchOrganization = (id) => {
  return (dispatch) => {
    rest.post(`/api/organizations/${id}/switch`)
      .then(response => {
        dispatch(switchedOrganization(response.data.jwt))
        window.location.reload(true)
      })
  }
}

export const deleteOrganization = (id) => {
  return (dispatch) => {
    rest.destroy(`/api/organizations/${id}`)
      .then(response => {})
  }
}

export const fetchedOrganization = (organization) => {
  return {
    type: FETCHED_ORGANIZATION,
    currentOrganizationId: organization.id,
    currentOrganizationName: organization.name
  }
}

export const switchedOrganization = (apikey) => {
  return {
    type: SWITCHED_ORGANIZATION,
    apikey,
    currentOrganizationId: getOrganizationId(apikey),
    currentOrganizationName: getOrganizationName(apikey)
  }
}

const getMembership = async () => {
  const organizations = await rest.get('/api/organizations/');
  return organizations.data;
}
