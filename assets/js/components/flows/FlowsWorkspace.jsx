import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Fragment,
} from "react";
import { useSelector } from "react-redux";
import ReactFlow, {
  isNode,
  isEdge,
  useStoreActions,
} from "react-flow-renderer";
import omit from "lodash/omit";
import FlowsNodesMenu from "./FlowsNodesMenu";
import FlowsSaveBar from "./FlowsSaveBar";
import LabelNode from "./nodes/LabelNode";
import FunctionNode from "./nodes/FunctionNode";
import ChannelNode from "./nodes/ChannelNode";
import DebugNode from "./nodes/DebugNode";
import DeviceNode from "./nodes/DeviceNode";
import InfoSidebar from "./infoSidebar/InfoSidebar";
import NodeInfo from "./infoSidebar/NodeInfo";
import { getStartedLinks } from "../Welcome";
import RocketFilled from "@ant-design/icons/RocketFilled";
import analyticsLogger from "../../util/analyticsLogger";
import UserCan, { userCan } from "../common/UserCan";
import debounce from "lodash/debounce";

const nodeTypes = {
  labelNode: LabelNode,
  functionNode: FunctionNode,
  channelNode: ChannelNode,
  debugNode: DebugNode,
  deviceNode: DeviceNode,
};

export default ({
  initialElementsMap,
  submitChanges,
  setChangesState,
  hasChanges,
  labels,
  functions,
  channels,
  devices,
  organization,
  checkEdgeAnimation,
}) => {
  const firstRender = useRef(true);
  const setSelectedElements = useStoreActions(
    (actions) => actions.setSelectedElements
  );
  const currentRole = useSelector((state) => state.organization.currentRole);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const onLoad = (_reactFlowInstance) =>
    setReactFlowInstance(_reactFlowInstance);

  const [elementsMap, setElements] = useState(initialElementsMap);
  const [latestElems, setLatestElems] = useState(initialElementsMap);
  const debouncedSubmit = useCallback(debounce(submitChanges, 2000), []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    debouncedSubmit(elementsMap);
  }, [elementsMap]);

  useEffect(() => {
    setLatestElems(initialElementsMap);
  }, [initialElementsMap]);

  const onElementDragStop = (event, node) => {
    if (userCan({ role: currentRole })) {
      const updatedNode = Object.assign({}, elementsMap[node.id], {
        position: { x: node.position.x, y: node.position.y },
      });
      setElements((elsMap) =>
        Object.assign({}, elsMap, { [node.id]: updatedNode })
      );
      setChangesState(true);
    }
  };

  const onElementsRemove = (elementsToRemove) => {
    if (userCan({ role: currentRole })) {
      if (!elementsToRemove[0]) return;

      if (isEdge(elementsToRemove[0])) {
        setElements((elsMap) => omit(elsMap, [elementsToRemove[0].id]));
      }
      if (isNode(elementsToRemove[0])) {
        const edges = Object.values(elementsMap)
          .filter(
            (el) =>
              isEdge(el) &&
              (el.source === elementsToRemove[0].id ||
                el.target === elementsToRemove[0].id)
          )
          .map((el) => el.id);

        setElements((elsMap) =>
          omit(elsMap, edges.concat(elementsToRemove[0].id))
        );
      }
      setChangesState(true);
    }
  };

  const onElementsAdd = ({ source, target }) => {
    if (userCan({ role: currentRole })) {
      const id = "edge-" + source + "-" + target;
      const newEdge = {
        id,
        source,
        target,
        animated: checkEdgeAnimation(source),
      };

      setElements((elsMap) => Object.assign({}, elsMap, { [id]: newEdge }));
      setChangesState(true);
    }
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const id = event.dataTransfer.getData("node/id");
    const type = event.dataTransfer.getData("node/type");
    const name = event.dataTransfer.getData("node/name");

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left - 75,
      y: event.clientY - reactFlowBounds.top,
    });

    let data = { label: name, id };
    if (type === "channelNode") {
      data = Object.assign({}, data, {
        type_name: event.dataTransfer.getData("node/channel_type_name"),
        type: event.dataTransfer.getData("node/channel_type"),
        hasAlerts: event.dataTransfer.getData("node/has_alerts") === "true",
      });
    }

    if (type === "functionNode") {
      data = Object.assign({}, data, {
        format: event.dataTransfer.getData("node/function_format"),
      });
    }

    if (type === "labelNode") {
      data = Object.assign({}, data, {
        deviceCount: event.dataTransfer.getData("node/label_device_count"),
        hasAlerts: event.dataTransfer.getData("node/has_alerts") === "true",
        adrAllowed: event.dataTransfer.getData("node/adr_allowed") === "true",
        cfListEnabled:
          event.dataTransfer.getData("node/cf_list_enabled") === "true",
        multi_buy_id:
          event.dataTransfer.getData("node/multi_buy_id") !== "null",
        devicesNotInFilter:
          event.dataTransfer.getData("node/devices_not_in_filter") === "true",
      });
    }

    if (type === "deviceNode") {
      data = Object.assign({}, data, {
        deviceCount: event.dataTransfer.getData("node/label_device_count"),
        hasAlerts: event.dataTransfer.getData("node/has_alerts") === "true",
        adrAllowed: event.dataTransfer.getData("node/adr_allowed") === "true",
        cfListEnabled:
          event.dataTransfer.getData("node/cf_list_enabled") === "true",
        multi_buy_id:
          event.dataTransfer.getData("node/multi_buy_id") !== "null",
        inXORFilter:
          event.dataTransfer.getData("node/in_xor_filter") === "true",
      });
    }

    const newNode = { id, type, position, data };

    if (type === "functionNode" && elementsMap[id]) {
      let i = 1;
      while (elementsMap[id + "_copy" + i]) {
        i++;
      }
      newNode.id = id + "_copy" + i;
    }

    setElements((elsMap) =>
      Object.assign({}, elsMap, { [newNode.id]: newNode })
    );
    setChangesState(true);
  };

  const onAdrUpdate = (id, adrAllowed) => {
    const newNodeData = Object.assign({}, elementsMap[id].data, { adrAllowed });
    const newNode = Object.assign({}, elementsMap[id], { data: newNodeData });
    setElements((elsMap) =>
      Object.assign({}, elsMap, { [newNode.id]: newNode })
    );
  };

  const onCFListUpdate = (id, cfListEnabled) => {
    const newNodeData = Object.assign({}, elementsMap[id].data, {
      cfListEnabled,
    });
    const newNode = Object.assign({}, elementsMap[id], { data: newNodeData });
    setElements((elsMap) =>
      Object.assign({}, elsMap, { [newNode.id]: newNode })
    );
  };

  const onMultiBuyUpdate = (id, multi_buy_id) => {
    const newNodeData = Object.assign({}, elementsMap[id].data, {
      multi_buy_id,
    });
    const newNode = Object.assign({}, elementsMap[id], { data: newNodeData });
    setElements((elsMap) =>
      Object.assign({}, elsMap, { [newNode.id]: newNode })
    );
  };

  const onAlertUpdate = (id, type, hasAlerts) => {
    // FOR FUNCTION ALERTS LATER IF NEEDED
    // if (type === "function") {
    //   let functionNodes = {};
    //   for (const [key, _value] of Object.entries(elementsMap)) {
    //     if (key.split("_copy")[0] === id) {
    //       const newNodeData = Object.assign({}, elementsMap[key].data, {
    //         hasAlerts,
    //       });
    //       const newNode = Object.assign({}, elementsMap[key], {
    //         data: newNodeData,
    //       });
    //       Object.assign(functionNodes, { [newNode.id]: newNode });
    //     }
    //   }
    //   setElements((elsMap) => Object.assign({}, elsMap, functionNodes));
    // }
    const newNodeData = Object.assign({}, elementsMap[id].data, {
      hasAlerts,
    });
    const newNode = Object.assign({}, elementsMap[id], { data: newNodeData });
    setElements((elsMap) =>
      Object.assign({}, elsMap, { [newNode.id]: newNode })
    );
  };

  const onLabelSidebarDevicesUpdate = (id, count) => {
    const newNodeData = Object.assign({}, elementsMap[id].data, {
      deviceCount: elementsMap[id].data.deviceCount + count,
    });
    const newNode = Object.assign({}, elementsMap[id], { data: newNodeData });
    setElements((elsMap) =>
      Object.assign({}, elsMap, { [newNode.id]: newNode })
    );
  };

  const handleToggleSidebar = () => {
    if (!showInfoSidebar) {
      analyticsLogger.logEvent("ACTION_OPEN_NODE_INFO_SIDEBAR", {
        id: selectedNodeId,
      });
    } else {
      analyticsLogger.logEvent("ACTION_CLOSE_NODE_INFO_SIDEBAR", {
        id: selectedNodeId,
      });
    }

    setShowInfoSidebar(!showInfoSidebar);
  };

  console.log({
    hasChanges,
    elementsMap: Object.values(elementsMap),
    latestElems: Object.values(latestElems),
  });

  return (
    <Fragment>
      <div
        ref={reactFlowWrapper}
        style={{ position: "relative", height: "100%", width: "100%" }}
      >
        {(organization.flow === '{"edges":[],"copies":[]}' ||
          organization.flow === "{}") &&
          !showInfoSidebar && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                right: 100,
                zIndex: 100,
                paddingLeft: 20,
              }}
            >
              <div className="pod" id="left">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "bottom",
                  }}
                >
                  <RocketFilled className="bigicon" />
                  <h2>Get Started with Console</h2>
                </div>
                {getStartedLinks()}
              </div>
            </div>
          )}
        <ReactFlow
          elements={
            hasChanges
              ? Object.values(elementsMap) !== Object.values(latestElems)
                ? Object.values(latestElems)
                : Object.values(elementsMap)
              : Object.values(latestElems)
          }
          nodeTypes={nodeTypes}
          onLoad={onLoad}
          onElementsRemove={onElementsRemove}
          onConnect={onElementsAdd}
          onNodeDragStop={onElementDragStop}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onSelectionChange={(elements) => {
            if (elements && elements.length === 1) {
              setShowInfoSidebar(true);
              setSelectedNodeId(elements[0].id);
            } else if (!elements) {
              setShowInfoSidebar(false);
            }
          }}
          selectNodesOnDrag={false}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
          nodesDraggable={userCan({ role: currentRole })}
          nodesConnectable={userCan({ role: currentRole })}
          deleteKeyCode={"keyboard delete not allowed"}
        />
        <UserCan>
          <FlowsNodesMenu
            labels={labels}
            functions={functions}
            channels={channels}
            devices={devices}
          />
          <FlowsSaveBar hasChanges={hasChanges} />
        </UserCan>
      </div>
      <InfoSidebar
        show={showInfoSidebar}
        width={550}
        toggle={handleToggleSidebar}
        id={
          selectedNodeId && selectedNodeId.split(/-(.+)/)[1].split("_copy")[0]
        }
        type={
          selectedNodeId && selectedNodeId.split(/-(.+)/)[0].replace("-", "")
        }
        debug={
          !!(
            selectedNodeId &&
            ["device", "label"].includes(
              selectedNodeId.split(/-(.+)/)[0].replace("-", "")
            )
          )
        }
      >
        <NodeInfo
          id={
            (selectedNodeId &&
              selectedNodeId.slice(0, 4) === "edge" &&
              selectedNodeId) ||
            (selectedNodeId &&
              selectedNodeId.split(/-(.+)/)[1].split("_copy")[0])
          }
          type={
            (selectedNodeId &&
              selectedNodeId.slice(0, 4) === "edge" &&
              "edge") ||
            (selectedNodeId &&
              selectedNodeId.split(/-(.+)/)[0].replace("-", ""))
          }
          elementsMap={elementsMap}
          hasChanges={hasChanges}
          onLabelSidebarDevicesUpdate={onLabelSidebarDevicesUpdate}
          onAdrUpdate={onAdrUpdate}
          onCFListUpdate={onCFListUpdate}
          onMultiBuyUpdate={onMultiBuyUpdate}
          onAlertUpdate={onAlertUpdate}
          hasConnectedEdges={
            Object.values(elementsMap).filter(
              (el) =>
                isEdge(el) &&
                (el.source === selectedNodeId || el.target === selectedNodeId)
            ).length > 0
          }
          deleteNode={(actualResourceDeleted = false) => {
            let edges = [];

            if (selectedNodeId.slice(0, 4) !== "edge") {
              edges = Object.values(elementsMap)
                .filter(
                  (el) =>
                    isEdge(el) &&
                    (el.source === selectedNodeId ||
                      el.target === selectedNodeId)
                )
                .map((el) => el.id);
            }

            setElements((elsMap) => omit(elsMap, edges.concat(selectedNodeId)));
            setChangesState(true);
            setShowInfoSidebar(false);
            setSelectedElements([]);
          }}
          orgId={currentOrganizationId}
        />
      </InfoSidebar>
    </Fragment>
  );
};
