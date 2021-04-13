import React from 'react';
import ReactFlow, {
  ReactFlowProvider,
  isNode,
  // useStoreState // TODO
} from 'react-flow-renderer';
import dagre from 'dagre';

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

const nodeWidth = 400; // TODO remove
const nodeHeight = 36; // TODO remove

const getLayoutedElements = (elements) => {
  dagreGraph.setGraph({ rankdir: 'LR' });

  elements.forEach((el) => {
    if (isNode(el)) {
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

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }

    return el;
  });
};

export default ({ elements }) => {
  // const nodes = useStoreState(state => state.nodes) // TODO and then node.__rf.width, node.__rf.height

  return (
    <div style={{ padding: '25px', height: '500px', width: '1000px' }}>
      <ReactFlowProvider>
        <ReactFlow 
          elements={getLayoutedElements(elements)}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          paneMoveable={false}
        />
      </ReactFlowProvider>
    </div>
  ); 
}