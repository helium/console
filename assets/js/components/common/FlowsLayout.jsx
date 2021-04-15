import React, { useState } from 'react';
import ReactFlow, {
  isNode,
  useStoreState
} from 'react-flow-renderer';
import dagre from 'dagre';
import find from 'lodash/find';

import LabelNode from './nodes/LabelNode';
import FunctionNode from './nodes/FunctionNode';
import ChannelNode from './nodes/ChannelNode';
import DeviceNode from './nodes/DeviceNode';

const nodeTypes = {
  labelNode: LabelNode,
  functionNode: FunctionNode,
  channelNode: ChannelNode,
  deviceNode: DeviceNode
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (elements, nodeSizes) => {
  const DEFAULT_NODE_WIDTH = 300; // TODO reduce so that flow can be shorter + fix if node is wider than this
  const DEFAULT_NODE_HEIGHT = 30;

  dagreGraph.setGraph({ rankdir: 'LR' });

  elements.forEach((el) => {
    if (isNode(el)) {
      const existingNode = find(nodeSizes, {id: el.id});
      let nodeWidth = existingNode ? existingNode.width : DEFAULT_NODE_WIDTH;
      let nodeHeight = existingNode ? existingNode.height : DEFAULT_NODE_HEIGHT;
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = 'left';
      el.sourcePosition = 'right';

      const existingNode = find(nodeSizes, {id: el.id});
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
  const nodes = useStoreState((state) => state.nodes);
  const nodeSizes = nodes.map(node => (
    { 
      id: node.id,
      width: node.__rf.width,
      height: node.__rf.height
    }
  ));

  const layoutedElements = getLayoutedElements(elements, nodeSizes);
  const [flowElements] = useState(layoutedElements); // prevents render loop

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
}