import React, { useEffect } from "react";
import { ReactFlowProvider } from "react-flow-renderer";
import { useSelector } from "react-redux";
import { Card, Typography } from "antd";
import { SkeletonLayout } from "../common/SkeletonLayout";
const { Text } = Typography;
import { FLOWS_BY_DEVICE, GET_RESOURCES_NAMES } from "../../graphql/flows";
import FlowsLayout from "../common/FlowsLayout";
import { useQuery } from "@apollo/client";

const FETCH_POLICY = "cache-and-network";

export default ({ deviceId, mobile }) => {
  const {
    loading: flowsByDeviceLoading,
    error: flowsByDeviceError,
    data: flowsByDeviceData,
    refetch: flowsByDeviceRefetch,
  } = useQuery(FLOWS_BY_DEVICE, {
    variables: { deviceId },
    fetchPolicy: FETCH_POLICY,
  });

  let flowsByDevice =
    (flowsByDeviceData && flowsByDeviceData.flowsByDevice) || [];
  let deviceIds = [];
  let channelIds = [];
  let labelIds = [];
  let functionIds = [];

  flowsByDevice &&
    flowsByDevice.forEach((flow) => {
      if (flow.channel_id && !channelIds.includes(flow.channel_id)) {
        channelIds.push(flow.channel_id);
      }
      if (flow.function_id && !functionIds.includes(flow.function_id)) {
        functionIds.push(flow.function_id);
      }
      if (flow.device_id && !deviceIds.includes(flow.device_id)) {
        deviceIds.push(flow.device_id);
      } else {
        deviceIds.push(deviceId);
      }
      if (flow.label_id && !labelIds.includes(flow.label_id)) {
        labelIds.push(flow.label_id);
      }
    });

  const {
    loading: getResourcesNamesLoading,
    error: getResourcesNamesError,
    data: getResourcesNamesData,
    refetch: getResourcesNamesRefetch,
  } = useQuery(GET_RESOURCES_NAMES, {
    skip: !flowsByDeviceData,
    variables: { deviceIds, channelIds, functionIds, labelIds },
    fetchPolicy: FETCH_POLICY,
  });

  const deviceNameMap = {};
  const channelNameMap = {};
  const functionNameMap = {};
  const labelNameMap = {};
  if (getResourcesNamesData) {
    getResourcesNamesData.deviceNames.forEach((dn) => {
      deviceNameMap[dn.id] = dn.name;
    });
    getResourcesNamesData.channelNames.forEach((cn) => {
      channelNameMap[cn.id] = cn.name;
    });
    getResourcesNamesData.functionNames.forEach((fn) => {
      functionNameMap[fn.id] = fn.name;
    });
    getResourcesNamesData.labelNames.forEach((ln) => {
      labelNameMap[ln.id] = ln.name;
    });
  }

  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const flowChannel = socket.channel("graphql:flows_update", {});
  const resourcesChannel = socket.channel("graphql:resources_update", {});

  useEffect(() => {
    // executed when mounted
    flowChannel.join();
    flowChannel.on(
      `graphql:flows_update:${currentOrganizationId}:organization_flows_update`,
      (message) => {
        flowsByDeviceRefetch();
      }
    );

    resourcesChannel.join();
    resourcesChannel.on(
      `graphql:resources_update:${currentOrganizationId}:organization_resources_update`,
      (message) => {
        getResourcesNamesRefetch();
      }
    );

    // executed when unmounted
    return () => {
      flowChannel.leave();
      resourcesChannel.leave();
    };
  }, []);

  if (flowsByDeviceLoading || getResourcesNamesLoading)
    return <SkeletonLayout />;
  if (flowsByDeviceError || getResourcesNamesError)
    return (
      <Text>Data failed to load, please reload the page and try again</Text>
    );

  const addCopyIfNodeExisting = (nodeId, existingElements) => {
    if (nodeId in existingElements) {
      let i = 1;
      while (existingElements[nodeId + "_copy" + i]) {
        i++;
      }
      return `${nodeId}_copy${i}`;
    } else {
      return nodeId;
    }
  };

  const generateElements = (id, flows) => {
    let elements = {};

    flows.forEach((f) => {
      const functionId = f.function_id;
      const channelId = f.channel_id;
      const deviceId = f.device_id || id;
      const labelId = f.label_id;

      let functionNodeId = `function-${functionId}`;
      functionNodeId = addCopyIfNodeExisting(functionNodeId, elements);

      let channelNodeId = `channel-${channelId}`;
      channelNodeId = addCopyIfNodeExisting(channelNodeId, elements);

      let deviceNodeId = `device-${deviceId}`;
      deviceNodeId = addCopyIfNodeExisting(deviceNodeId, elements);

      let labelNodeId = `label-${labelId}`;
      labelNodeId = addCopyIfNodeExisting(labelNodeId, elements);

      elements[channelNodeId] = {
        id: channelNodeId,
        data: {
          label: channelNameMap[channelId],
        },
        position: [0, 0],
        type: "channelNode",
      };

      if (functionId) {
        elements[functionNodeId] = {
          id: functionNodeId,
          data: {
            label: functionNameMap[functionId] || "",
          },
          position: [0, 0],
          type: "functionNode",
        };
        const edgeNodeId = `edge-${functionNodeId}-${channelNodeId}`;
        elements[edgeNodeId] = {
          id: edgeNodeId,
          source: functionNodeId,
          target: channelNodeId,
        };
      }

      if (labelId) {
        elements[deviceNodeId] = {
          id: deviceNodeId,
          data: {
            label: deviceNameMap[deviceId],
          },
          position: [0, 0],
          type: "deviceNode",
        };
        elements[labelNodeId] = {
          id: labelNodeId,
          data: {
            label: labelNameMap[labelId],
          },
          position: [0, 0],
          type: "labelNode",
        };

        const edgeNodeId = `edge-${deviceNodeId}-${labelNodeId}`;
        elements[edgeNodeId] = {
          id: edgeNodeId,
          source: deviceNodeId,
          target: labelNodeId,
        };

        if (functionId) {
          const edgeNodeId = `edge-${labelNodeId}-${functionNodeId}`;
          elements[edgeNodeId] = {
            id: edgeNodeId,
            source: labelNodeId,
            target: functionNodeId,
          };
        } else {
          const edgeNodeId = `edge-${labelNodeId}-${channelNodeId}`;
          elements[edgeNodeId] = {
            id: edgeNodeId,
            source: labelNodeId,
            target: channelNodeId,
          };
        }
      } else {
        elements[deviceNodeId] = {
          id: deviceNodeId,
          data: {
            label: deviceNameMap[deviceId],
          },
          position: [0, 0],
          type: "deviceNode",
        };

        if (functionId) {
          const edgeNodeId = `edge-${deviceNodeId}-${functionNodeId}`;
          elements[edgeNodeId] = {
            id: edgeNodeId,
            source: deviceNodeId,
            target: functionNodeId,
          };
        } else {
          const edgeNodeId = `edge-${deviceNodeId}-${channelNodeId}`;
          elements[edgeNodeId] = {
            id: edgeNodeId,
            source: deviceNodeId,
            target: channelNodeId,
          };
        }
      }
    });

    return Object.values(elements);
  };

  const elements = generateElements(deviceId, flowsByDevice);

  const renderContainer = (children) => {
    if (mobile) {
      return children
    } else {
      return (
        <Card
          bodyStyle={{ padding: 0, paddingTop: 1, overflowX: "scroll" }}
          title="Flows"
        >
          {children}
        </Card>
      )
    }
  }

  return renderContainer(
    <React.Fragment>
      {elements.length > 0 ? (
        <div
          style={{
            padding: "20px",
            position: "relative",
            width: "1600px",
            height: `${90 * (flowsByDevice.length || 50)}px`,
          }}
        >
          <ReactFlowProvider>
            <FlowsLayout elements={elements} />
          </ReactFlowProvider>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: "grey" }}>
          No flows exist for this device
        </div>
      )}
    </React.Fragment>
  );
};
