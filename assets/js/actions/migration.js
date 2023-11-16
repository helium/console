import * as rest from "../util/rest";
import sanitizeHtml from "sanitize-html";

export const getApplications = (api_key, tenant_id) =>
  rest
    .post("/api/migration/applications", {
      api_key, tenant_id
    })
    .then(({ data }) => data);

export const getDevices = (label_id, api_key, tenant_id) =>
  rest
    .post("/api/migration/devices", {
      label_id, api_key, tenant_id
    })
    .then(({ data }) => data);

export const createDevice = (device_id, api_key, application_id, tenant_id, region, devaddr, nwk_s_key, app_s_key, migration_status) =>
  rest
    .post("/api/migration/devices/new", {
      device_id, api_key, application_id, tenant_id, region, devaddr, nwk_s_key, app_s_key, migration_status
    })
    .then(({ data }) => data);
