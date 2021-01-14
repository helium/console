import React, { useState } from 'react';
import ReactFlow, { isNode, removeElements, addEdge } from 'react-flow-renderer';
import LabelNode from './LabelNode'
import FunctionNode from './FunctionNode'
import ChannelNode from './ChannelNode'
import DebugNode from './DebugNode'
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const getLayoutedElements = (elements, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });
  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: 150, height: 50 });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });
  dagre.layout(dagreGraph);
  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = isHorizontal ? 'left' : 'top';
      el.sourcePosition = isHorizontal ? 'right' : 'bottom';
      // unfortunately we need this little hack to pass a slightly different position in order to notify react flow about the change
      el.position = {
        x: nodeWithPosition.x + Math.random() / 1000,
        y: nodeWithPosition.y,
      };
    }
    return el;
  });
};

const nodeTypes = {
  labelNode: LabelNode,
  functionNode: FunctionNode,
  channelNode: ChannelNode,
  debugNode: DebugNode
};

export default ({ initialElements, selectNode }) => {
  const layoutedElements = getLayoutedElements(initialElements, 'LR')
  const [elements, setElements] = useState(layoutedElements);
  const onElementClick = (e, el) => selectNode(el)

  return (
    <ReactFlow
      elements={elements}
      onElementClick={onElementClick}
      nodeTypes={nodeTypes}
    />
  );
};
