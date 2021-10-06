import { push } from 'connected-react-router';
import sanitizeHtml from 'sanitize-html'
import * as rest from '../util/rest';
import { displayError } from "../util/messages";

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
        localStorage.setItem('organization', JSON.stringify({ id: organizations[0].id }));
        return dispatch(fetchedOrganization(organizations[0]));
      }
    } else {
      // validate or replace organization id
      const fetchedOrganizations = await getOrganizations();
      const org = fetchedOrganizations.find(
        org => org.id === organization.id
      );
      if (org) {
        return dispatch(fetchedOrganization(org));
      } else if (fetchedOrganizations.length) {
        localStorage.setItem(
          'organization',
          JSON.stringify({ id: fetchedOrganizations[0].id })
        );
        return dispatch(fetchedOrganization(fetchedOrganizations[0]));
      }
    }
    return dispatch(fetchedOrganization({ id: null, name: "", role: "" }));
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

export const updateOrganization = (id, active) => {
  return (dispatch) => {
    rest.put(`/api/organizations/${id}`, {
      active
    })
    .then(response => {})
  }
}

export const switchOrganization = (organization) => {
  return (dispatch) => {
    rest.put(`/api/organizations/${organization.id}`, {
      switch_org_id: organization.id
    })
    .then(response => {
      localStorage.setItem('organization', JSON.stringify(organization));
      dispatch(switchedOrganization(organization));
      window.location.reload(true);
    })
  }
}

export const joinOrganization = (token) => {
  let params = { invitation: { token } };
  if (token) {
    return async (dispatch) => {
      rest.post("/api/users", params).then((response) => {
        dispatch(fetchedOrganization(response.data[0]));
        localStorage.setItem("organization", JSON.stringify(response.data[0]));
        window.location.replace("/organizations");
      });
    };
  } else {
    displayError("Unable to find and accept invitation");
  }
};

export const deleteOrganization = (id, destinationOrgId = 'no-transfer') => {
  return (dispatch) => {
    rest.destroy(`/api/organizations/${id}?destination_org_id=${destinationOrgId}`)
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
    currentOrganizationName: organization.name,
    currentRole: organization.role,
    currentOrganizationAppEui: organization.app_eui
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
