import * as rest from "../util/rest";

export const createPacketConfig = ({
  name,
  multiBuyValue,
  multiActive,
  preferredActive,
}) => {
  return (dispatch) => {
    return rest
      .post("/api/packet_configs", {
        packet_config: {
          name: name,
          multi_buy_value: multiBuyValue,
          multi_active: multiActive,
          preferred_active: preferredActive,
        },
      })
      .then((response) => {});
  };
};

export const deletePacketConfig = (id) => {
  return (dispatch) => {
    return rest.destroy(`/api/packet_configs/${id}`).then((response) => {});
  };
};

export const updatePacketConfig = (
  id,
  { multiBuyValue, multiActive, preferredActive, name }
) => {
  return (dispatch) => {
    return rest
      .put(`/api/packet_configs/${id}`, {
        packet_config: {
          name: name,
          multi_buy_value: multiBuyValue,
          multi_active: multiActive,
          preferred_active: preferredActive,
        },
      })
      .then((response) => {});
  };
};

export const addPacketConfigToNode = (packetConfigId, nodeId, nodeType) => {
  return (dispatch) => {
    return rest
      .post(`/api/packet_configs/add_to_node`, {
        packet_config_id: packetConfigId,
        node_id: nodeId,
        node_type: nodeType,
      })
      .then((response) => {});
  };
};

export const removePacketConfigFromNode = (nodeId, nodeType) => {
  return (dispatch) => {
    return rest
      .post(`/api/packet_configs/remove_from_node`, {
        node_id: nodeId,
        node_type: nodeType,
      })
      .then((response) => {});
  };
};
