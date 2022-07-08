import { push } from "connected-react-router";
import sanitizeHtml from "sanitize-html";
import * as rest from "../util/rest";
import analyticsLogger from "../util/analyticsLogger";
import { displayError, displayInfo } from "../util/messages";

export const FETCHED_ORGANIZATION = "FETCHED_ORGANIZATIONS";
export const FETCHING_ORGANIZATION = "FETCHING_ORGANIZATION";
export const SWITCHED_ORGANIZATION = "SWITCHED_ORGANIZATION";

export const fetchOrganization = () => {
  return async (dispatch) => {
    dispatch(fetchingOrganization());
    let organization;
    try {
      organization = JSON.parse(localStorage.getItem("organization"));
    } catch (e) {
      organization = null;
    }
    if (!organization) {
      // get a new organization id
      const organizations = await getOrganizations();
      if (organizations && organizations.length) {
        localStorage.setItem(
          "organization",
          JSON.stringify({ id: organizations[0].id })
        );
        return dispatch(fetchedOrganization(organizations[0]));
      }
    } else {
      // validate or replace organization id
      const fetchedOrganizations = await getOrganizations();
      const org = fetchedOrganizations.find(
        (org) => org.id === organization.id
      );
      if (org) {
        return dispatch(fetchedOrganization(org));
      } else if (fetchedOrganizations.length) {
        localStorage.setItem(
          "organization",
          JSON.stringify({ id: fetchedOrganizations[0].id })
        );
        return dispatch(fetchedOrganization(fetchedOrganizations[0]));
      }
    }
    return dispatch(fetchedOrganization({ id: null, name: "", role: "" }));
  };
};

export const createOrganization = (name, noOtherOrg = false) => {
  return (dispatch) => {
    rest
      .post("/api/organizations", {
        organization: {
          name: sanitizeHtml(name),
          from: "browser"
        },
      })
      .then((response) => {
        if (noOtherOrg) {
          dispatch(fetchedOrganization(response));
          window.location.reload(true);
        }
      });
  };
};

export const updateOrganization = (id, active) => {
  return (dispatch) => {
    rest
      .put(`/api/organizations/${id}`, {
        active,
      })
      .then((response) => {});
  };
};

export const switchOrganization = (organization) => {
  return (dispatch) => {
    rest
      .put(`/api/organizations/${organization.id}`, {
        switch_org_id: organization.id,
      })
      .then((response) => {
        localStorage.setItem("organization", JSON.stringify(organization));
        dispatch(switchedOrganization(organization));
        window.location.reload(true);
      });
  };
};

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

export const deleteOrganization = (id, destinationOrgId = "no-transfer") => {
  return (dispatch) => {
    rest
      .destroy(
        `/api/organizations/${id}?destination_org_id=${destinationOrgId}`
      )
      .then((response) => {});
  };
};

export const fetchingOrganization = () => {
  return {
    type: FETCHING_ORGANIZATION,
  };
};

export const fetchedOrganization = (organization) => {
  return {
    type: FETCHED_ORGANIZATION,
    currentOrganizationId: organization.id,
    currentOrganizationName: organization.name,
    currentRole: organization.role,
    currentOrganizationAppEui: organization.app_eui,
  };
};

export const switchedOrganization = (organization) => {
  return {
    type: SWITCHED_ORGANIZATION,
    currentOrganizationId: organization.id,
    currentOrganizationName: organization.name,
  };
};

const getOrganizations = async () => {
  const organizations = await rest.get("/api/organizations/");
  return organizations.data;
};

export const importOrganization = (org_json) => {
  return rest.post("/api/organizations/import", org_json);
};

export const submittedOrganizationSurvey = () => {
  setTimeout(() => rest.post("/api/organizations/survey", {}), 3000);
};

export const submitSurveyToken = (token) => {
  return rest.post("/api/organizations/survey_token", { token });
};

export const resendSurveyToken = () => {
  return rest.post("/api/organizations/survey_token/resend", {}).then(() => {
    displayInfo("An email containing the token has been resent");
  });
};

export const exportOrganization = (id, name, deactivate) => {
  return rest
    .get(`/api/organizations/export?deactivate=${deactivate}`)
    .then((resp) => {
      analyticsLogger.logEvent("ACTION_EXPORT_ORGANIZATION_JSON", {
        organization_id: id,
      });

      const json = JSON.stringify(resp.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = name + "-export.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .then(() => {
      displayInfo("Your organization has been successfully exported");
    })
    .catch(() => {
      displayError("Failed to export organization JSON");
    });
};

export const renameOrganization = (id, params) => {
  return (dispatch) => {
    const name = sanitizeHtml(params.name);

    return rest
      .put(`/api/organizations/${id}`, {
        name: name,
      })
      .then((response) => {});
  };
};
