import * as rest from "../util/rest";
import sanitizeHtml from "sanitize-html";

export const getApplications = (api_key, tenant_id) =>
  rest
    .post("/api/migration/applications", {
      api_key, tenant_id
    })
    .then(({ data }) => data);

export const getDevices = (label_id) =>
  rest
    .post("/api/migration/devices", {
      label_id
    })
    .then(({ data }) => data);
