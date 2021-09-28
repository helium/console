import * as rest from "../util/rest";

export const createConfigProfile = (configProfile) => {
  return (dispatch) => {
    return rest
      .post("/api/config_profiles", {
        config_profile: configProfile,
      })
      .then((response) => {});
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
