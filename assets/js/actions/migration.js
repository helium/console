import * as rest from "../util/rest";

export const getApplications = (api_key, tenant_id, instance_region) =>
  rest
    .post("/api/migration/applications", {
      api_key, tenant_id, instance_region
    })
    .then(({ data }) => data);

export const getDevices = (label_id, api_key, tenant_id, instance_region) =>
  rest
    .post("/api/migration/devices", {
      label_id, api_key, tenant_id, instance_region
    })
    .then(({ data }) => data);

export const createDevice = (device_id, api_key, application_id, tenant_id, label_id, region, devaddr, nwk_s_key, app_s_key, migration_status, instance_region) =>
  rest
    .post("/api/migration/devices/new", {
      device_id, api_key, application_id, tenant_id, label_id, region, devaddr, nwk_s_key, app_s_key, migration_status, instance_region
    })
    .then(({ data }) => data);
