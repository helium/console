import React, { useState } from 'react';
import ReactFlow, { isNode, removeElements, addEdge } from 'react-flow-renderer';
import findIndex from 'lodash/findIndex'
import LabelNode from './LabelNode'
import FunctionNode from './FunctionNode'
import ChannelNode from './ChannelNode'
import DebugNode from './DebugNode'
import dagre from 'dagre'

const LEFT_RIGHT_LAYOUT = 'LR'
const TOP_BOTTOM_LAYOUT = 'TB'

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const addDagreLayoutToElements = (elements, direction = TOP_BOTTOM_LAYOUT) => {
  const isHorizontal = direction === LEFT_RIGHT_LAYOUT;
  dagreGraph.setGraph({ rankdir: direction });
  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: 200, height: 70 });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });
  dagre.layout(dagreGraph);

  const edgeSet = elements.reduce((acc, el) => {
    if (!isNode(el)) return Object.assign({}, acc, { [el.source]: true, [el.target]: true })
    return acc
  }, {})

  const unconnectedNodes = elements.filter(el => isNode(el) && !edgeSet[el.id])

  return elements.map((el) => {
    if (isNode(el)) {
      if (!edgeSet[el.id]) {
        const index = findIndex(unconnectedNodes, {id: el.id})
        console.log(el)
        el.position = {
          x: 1000 + Math.random() / 1000,
          y: 40 + index * 100,
        };
      } else {
        const nodeWithPosition = dagreGraph.node(el.id);
        el.targetPosition = isHorizontal ? 'left' : 'top';
        el.sourcePosition = isHorizontal ? 'right' : 'bottom';
        // unfortunately we need this little hack to pass a slightly different position in order to notify react flow about the change
        let x = nodeWithPosition.x + Math.random() / 1000
        if (el.type == 'channelNode') x += 250
        el.position = {
          x: x - 50,
          y: nodeWithPosition.y,
        };
      }
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
  const layoutedElements = addDagreLayoutToElements(initialElements, LEFT_RIGHT_LAYOUT)
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
