import React, { useState, useEffect } from "react";
import ReactFlow, { isNode, useStoreState } from "react-flow-renderer";
import dagre from "dagre";
import find from "lodash/find";

import LabelNode from "./nodes/LabelNode";
import FunctionNode from "./nodes/FunctionNode";
import ChannelNode from "./nodes/ChannelNode";
import DeviceNode from "./nodes/DeviceNode";

const nodeTypes = {
  labelNode: LabelNode,
  functionNode: FunctionNode,
  channelNode: ChannelNode,
  deviceNode: DeviceNode,
};

const getLayoutElements = (elements, nodeSizes) => {
  const DEFAULT_NODE_WIDTH = 50; // for initial render
  const DEFAULT_NODE_HEIGHT = 30;
  const g = new dagre.graphlib.Graph({});
  g.setGraph({ rankdir: "LR" });
  g.setDefaultEdgeLabel(() => ({}));

  elements.forEach((el) => {
    if (isNode(el)) {
      const existingNode = find(nodeSizes, { id: el.id });
      let nodeWidth = existingNode ? existingNode.width : DEFAULT_NODE_WIDTH;
      let nodeHeight = existingNode ? existingNode.height : DEFAULT_NODE_HEIGHT;
      g.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      g.setEdge(el.source, el.target);
    }
  });

  dagre.layout(g);

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = g.node(el.id);
      el.targetPosition = "left";
      el.sourcePosition = "right";

      const existingNode = find(nodeSizes, { id: el.id });
      let nodeWidth = existingNode ? existingNode.width : DEFAULT_NODE_WIDTH;
      let nodeHeight = existingNode ? existingNode.height : DEFAULT_NODE_HEIGHT;

      // unfortunate hack needed to pass a slightly different position to notify change to react flow
      // shifts the dagre node position (anchor=center center) to the top left
      // so it matches the react flow node anchor point
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }

    return el;
  });
};

export default ({ elements }) => {
  const nodeStates = useStoreState((state) => state.nodes);
  const nodeSizes = nodeStates.map((node) => ({
    id: node.id,
    width: node.__rf.width,
    height: node.__rf.height,
  }));

  const layoutedElements = getLayoutElements(elements, nodeSizes);
  const [flowElements, setFlowElements] = useState([]);

  useEffect(() => {
    setFlowElements(layoutedElements);
  }, [nodeSizes.length]);

  return (
    <ReactFlow
      elements={flowElements}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      paneMoveable={false}
    />
  );
};
