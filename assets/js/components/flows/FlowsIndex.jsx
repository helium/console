import React, { Component } from "react";
import withGql from "../../graphql/withGql";
import moment from "moment";
import { connect } from "react-redux";
import { isEdge, isNode, ReactFlowProvider } from "react-flow-renderer";
import { Prompt } from "react-router";
import { ALL_RESOURCES } from "../../graphql/flows";
import { updateFlows } from "../../actions/flow";
import { getIntegrationTypeForFlows } from "../../util/flows";
import DashboardLayout from "../common/DashboardLayout";
import FlowsWorkspace from "./FlowsWorkspace";
import { Typography, Spin, message } from "antd";
import find from "lodash/find";
const { Text } = Typography;
import UserCan from "../common/UserCan";
import analyticsLogger from "../../util/analyticsLogger";
import { checkIfDevicesNotInFilter } from "../../util/constants";

class FlowsIndex extends Component {
  state = {
    hasChanges: false,
  };

  setChangesState = (hasChanges) => {
    this.setState({ hasChanges });
  };

  submitChanges = (newElementsMap) => {
    const [completePaths, elementPositions] = getCompleteFlows(newElementsMap);

    updateFlows(completePaths, elementPositions)
      .then((status) => {
        analyticsLogger.logEvent("ACTION_UPDATE_FLOWS");
        if (status == 200) {
          this.props.allResourcesQuery.refetch();
          this.setState({ hasChanges: false });
        }
      })
      .catch((err) => {});
  };

  getActiveLabels() {
    let activeLabels = {};
    const { allLabels } = this.props.allResourcesQuery.data;
    allLabels.forEach((l) => {
      const labelHasStaleDevices = l.devices.some(
        (d) =>
          !moment()
            .utc()
            .local()
            .subtract(1, "days")
            .isBefore(moment.utc(d.last_connected).local())
      );
      if (l.devices.length > 0 && !labelHasStaleDevices) {
        activeLabels[l.id] = l;
      }
    });
    return activeLabels;
  }

  getActiveDevices() {
    let activeDevices = {};
    const { allDevices } = this.props.allResourcesQuery.data;
    allDevices.forEach((d) => {
      if (
        moment()
          .utc()
          .local()
          .subtract(1, "days")
          .isBefore(moment.utc(d.last_connected).local())
      ) {
        activeDevices[d.id] = d;
      }
    });
    return activeDevices;
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_FLOWS_PAGE");

    const orgId = this.props.currentOrganizationId;
    const { socket } = this.props;

    this.channel = socket.channel("graphql:flows_nodes_menu", {});
    this.channel.join();
    this.channel.on(
      `graphql:flows_nodes_menu:${orgId}:all_resources_update`,
      (message) => {
        this.props.allResourcesQuery.refetch();
      }
    );

    this.filterChannel = socket.channel("graphql:xor_filter_update", {});
    this.filterChannel.join();
    this.filterChannel.on(
      `graphql:xor_filter_update:${orgId}:organization_xor_filter_update`,
      (msg) => {
        this.props.allResourcesQuery.refetch();
        message.info("Devices in filter updated. Please refresh.", 60);
      }
    );
  }

  componentWillUnmount() {
    this.channel.leave();
    this.filterChannel.leave();
  }

  render() {
    const { loading, error } = this.props.allResourcesQuery;
    if (loading)
      return (
        <DashboardLayout fullHeightWidth user={this.props.user}>
          <div
            style={{
              height: "100%",
              width: "100%",
              padding: 300,
              textAlign: "center",
            }}
          >
            <Spin size="large" />
          </div>
        </DashboardLayout>
      );
    if (error)
      return (
        <DashboardLayout fullHeightWidth user={this.props.user}>
          <div style={{ padding: 20 }}>
            <Text>
              Workspace data failed to load, please reload the page and try
              again
            </Text>
          </div>
        </DashboardLayout>
      );

    const { organization } = this.props.allResourcesQuery.data;

    const activeLabels = this.getActiveLabels();
    const activeDevices = this.getActiveDevices();

    const flowPositions = JSON.parse(organization.flow);
    const [initialElementsMap, nodesByType] = generateInitialElementsMap(
      this.props.allResourcesQuery.data,
      flowPositions,
      {
        activeLabels,
        activeDevices,
      }
    );

    return (
      <DashboardLayout fullHeightWidth user={this.props.user} noFooter>
        <UserCan>
          <Prompt
            when={this.state.hasChanges}
            message="You have unsaved changes, are you sure you want to leave this page?"
          />
        </UserCan>
        <ReactFlowProvider>
          <FlowsWorkspace
            initialElementsMap={initialElementsMap}
            submitChanges={this.submitChanges}
            setChangesState={this.setChangesState}
            hasChanges={this.state.hasChanges}
            labels={nodesByType.labels}
            channels={nodesByType.channels}
            functions={nodesByType.functions}
            devices={nodesByType.devices}
            organization={organization}
            checkEdgeAnimation={(source) => {
              return checkEdgeAnimation(
                {
                  activeLabels,
                  activeDevices,
                },
                flowPositions.edges,
                source
              );
            }}
          />
        </ReactFlowProvider>
      </DashboardLayout>
    );
  }
}

const getCompleteFlows = (newElementsMap) => {
  const deviceAndLabelNodes = Object.values(newElementsMap).filter(
    (el) => el.type === "deviceNode" || el.type === "labelNode"
  );
  const edges = Object.values(newElementsMap).filter((el) => isEdge(el));
  let paths = [];

  const getPaths = (node, path) => {
    if (node.type === "channelNode") {
      paths.push(path);
      return;
    }

    edges.forEach((edge) => {
      if (edge.source === node.id) {
        const nextNode = newElementsMap[edge.target];
        getPaths(
          nextNode,
          path.concat({ type: nextNode.type, id: nextNode.data.id })
        );
      }
    });
  };

  deviceAndLabelNodes.forEach((node) => {
    getPaths(node, [{ type: node.type, id: node.data.id }]);
  });

  const elementPositions = Object.keys(newElementsMap).reduce(
    (acc, key) => {
      if (isNode(newElementsMap[key])) {
        const element = {
          position: newElementsMap[key].position,
        };
        if (key.indexOf("_copy") !== -1) {
          return Object.assign({}, acc, {
            [key]: element,
            copies: acc.copies.concat(Object.assign({}, { id: key }, element)),
          });
        } else {
          return Object.assign({}, acc, { [key]: element });
        }
      } else {
        const edge = {
          source: newElementsMap[key].source,
          target: newElementsMap[key].target,
        };
        return Object.assign({}, acc, { edges: acc.edges.concat(edge) });
      }
    },
    { edges: [], copies: [] }
  );

  return [paths, elementPositions];
};

const checkEdgeAnimation = (resources, edges, source) => {
  if (source.startsWith("label")) {
    return !!resources.activeLabels[source.split(/-(.+)/)[1]];
  } else if (source.startsWith("device")) {
    return !!resources.activeDevices[source.split(/-(.+)/)[1]];
  } else {
    const relevantEdges = edges.filter((e) => e.target === source);
    return relevantEdges.some((e) => {
      if (e.source.startsWith("label")) {
        return !!resources.activeLabels[e.source.split(/-(.+)/)[1]];
      } else if (e.source.startsWith("device")) {
        return !!resources.activeDevices[e.source.split(/-(.+)/)[1]];
      }
    });
  }
};

const generateInitialElementsMap = (data, flowPositions, activeResources) => {
  const { allLabels, allFunctions, allChannels, allDevices } = data;
  let initialElementsMap = {};
  const labels = [];
  const devices = [];
  const functions = [];
  const channels = [];

  allDevices.forEach((device) => {
    const node = {
      id: `device-${device.id}`,
      type: "deviceNode",
      data: {
        label: device.name,
        id: `device-${device.id}`,
        multi_buy_id: device.multi_buy_id,
        hasAlerts: device.alerts.length > 0,
        inXORFilter: device.in_xor_filter,
        config_profile_id: device.config_profile_id,
      },
      position: [0, 0],
    };
    devices.push(node);

    if (flowPositions[`device-${device.id}`]) {
      initialElementsMap[`device-${device.id}`] = node;
      node.position = flowPositions[`device-${device.id}`].position;
    }
  });
  allLabels.forEach((label) => {
    const node = {
      id: `label-${label.id}`,
      type: "labelNode",
      data: {
        label: label.name,
        id: `label-${label.id}`,
        deviceCount: label.device_count,
        multi_buy_id: label.multi_buy_id,
        hasAlerts: label.alerts.length > 0,
        devicesNotInFilter: checkIfDevicesNotInFilter(label),
        config_profile_id: label.config_profile_id,
      },
      position: [0, 0],
    };
    labels.push(node);

    if (flowPositions[`label-${label.id}`]) {
      initialElementsMap[`label-${label.id}`] = node;
      node.position = flowPositions[`label-${label.id}`].position;
    }
  });
  allFunctions.forEach((func) => {
    const node = {
      id: `function-${func.id}`,
      type: "functionNode",
      data: {
        label: func.name,
        id: `function-${func.id}`,
        format: func.format,
        hasAlerts: func.alerts.length > 0,
      },
      position: [0, 0],
    };
    functions.push(node);

    if (flowPositions[`function-${func.id}`]) {
      initialElementsMap[`function-${func.id}`] = node;
      node.position = flowPositions[`function-${func.id}`].position;
    }
  });
  allChannels.forEach((channel) => {
    const type = getIntegrationTypeForFlows(channel.endpoint, channel.type);

    const node = {
      id: `channel-${channel.id}`,
      type: "channelNode",
      data: {
        label: channel.name,
        id: `channel-${channel.id}`,
        type_name: channel.type_name,
        type,
        hasAlerts: channel.alerts.length > 0,
        lastErrored: channel.last_errored,
      },
      position: [0, 0],
    };
    channels.push(node);
    if (flowPositions[`channel-${channel.id}`]) {
      initialElementsMap[`channel-${channel.id}`] = node;
      node.position = flowPositions[`channel-${channel.id}`].position;
    }
  });

  // currently only function nodes can be duplicated
  flowPositions.copies &&
    flowPositions.copies.map((copiedNode) => {
      const originalId = copiedNode.id
        .slice(0, copiedNode.id.indexOf("_copy"))
        .slice(9);
      const func = find(allFunctions, { id: originalId });

      if (func) {
        const node = {
          id: copiedNode.id,
          type: "functionNode",
          data: {
            label: func.name,
            id: `function-${func.id}`,
            format: func.format,
            hasAlerts: func.alerts.length > 0,
          },
          position: [0, 0],
        };

        if (flowPositions[copiedNode.id]) {
          initialElementsMap[copiedNode.id] = node;
          node.position = flowPositions[copiedNode.id].position;
        }
      }
    });

  flowPositions.edges &&
    flowPositions.edges.forEach((edge) => {
      if (initialElementsMap[edge.source] && initialElementsMap[edge.target]) {
        const id = "edge-" + edge.source + "-" + edge.target;
        const isAnimated = checkEdgeAnimation(
          activeResources,
          flowPositions.edges,
          edge.source
        );
        const element = {
          id,
          source: edge.source,
          target: edge.target,
          animated: isAnimated,
        };
        initialElementsMap[id] = element;
      }
    });
  return [initialElementsMap, { labels, devices, functions, channels }];
};

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  };
}

export default connect(
  mapStateToProps,
  null
)(
  withGql(FlowsIndex, ALL_RESOURCES, (props) => ({
    fetchPolicy: "network-only",
    variables: { id: props.currentOrganizationId },
    name: "allResourcesQuery",
  }))
);
