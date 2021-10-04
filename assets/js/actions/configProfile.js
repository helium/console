import * as rest from "../util/rest";

export const createConfigProfile = (configProfile) => {
  return (dispatch) => {
    return rest.post("/api/config_profiles", {
      config_profile: configProfile,
    });
  };
};

export const deleteConfigProfile = (id) => {
  return (dispatch) => {
    return rest.destroy(`/api/config_profiles/${id}`).then((response) => {});
  };
};

export const updateConfigProfile = (id, configProfile) => {
  return (dispatch) => {
    return rest
      .put(`/api/config_profiles/${id}`, {
        config_profile: configProfile,
      })
      .then((response) => {});
  };
};

export const addConfigProfileToNode = (configProfileId, nodeId, nodeType) => {
  return (dispatch) => {
    return rest
      .post(`/api/config_profiles/add_to_node`, {
        config_profile_id: configProfileId,
        node_id: nodeId,
        node_type: nodeType,
      })
      .then((response) => {});
  };
};

export const removeConfigProfileFromNode = (nodeId, nodeType) => {
  return (dispatch) => {
    return rest
      .post(`/api/config_profiles/remove_from_node`, {
        node_id: nodeId,
        node_type: nodeType,
      })
      .then((response) => {});
  };
};
