import * as rest from "../util/rest";

export const updateOrganizationHotspot = (hotspot_address, claimed) => {
  return rest
    .post(`/api/organization_hotspot`, {
      hotspot_address,
      claimed,
    })
    .then((res) => res.status);
};

export const updateHotspotAlias = (hotspot_address, alias) => {
  return rest
    .post(`/api/organization_hotspot`, {
      hotspot_address,
      alias,
    })
    .then((res) => res.status);
};

export const updateOrganizationHotspots = (hotspot_addresses, claimed) => {
  return rest
    .post(`/api/organization_hotspots`, {
      hotspot_addresses,
      claimed,
    })
    .then((res) => res.status);
};

export const addHotspotToGroup = (hotspotId, groupId) => {
  return (dispatch) => {
    return rest
      .post("/api/hotspot_group", {
        hotspot_id: hotspotId,
        group_id: groupId,
      })
      .then((res) => res.status);
  };
};

export const removeHotspotFromGroup = (hotspotId, groupId) => {
  return (dispatch) => {
    return rest
      .post("/api/delete_hotspot_group", {
        hotspot_id: hotspotId,
        group_id: groupId,
      })
      .then((res) => res.status);
  };
};

export const createGroup = (group) => {
  return (dispatch) => {
    return rest
      .post("/api/groups", {
        group,
      })
      .then((res) => res.status);
  };
};

export const updateGroup = (id, group) => {
  return (dispatch) => {
    return rest
      .put(`/api/groups/${id}`, {
        group,
      })
      .then((res) => res.status);
  };
};

export const deleteGroup = (id) => {
  return (dispatch) => {
    return rest.destroy(`/api/groups/${id}`).then((res) => res.status);
  };
};
