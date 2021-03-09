import React, { useState, useRef, useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, isNode, isEdge, removeElements, addEdge, getOutgoers } from 'react-flow-renderer';
import findIndex from 'lodash/findIndex'
import find from 'lodash/find'
import omit from 'lodash/omit'
import FlowsSidebar from './FlowsSidebar'
import FlowsSettingsBar from './FlowsSettingsBar'
import LabelNode from './nodes/LabelNode'
import FunctionNode from './nodes/FunctionNode'
import ChannelNode from './nodes/ChannelNode'
import DebugNode from './nodes/DebugNode'
import DeviceNode from './nodes/DeviceNode'
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

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = isHorizontal ? 'left' : 'top';
      el.sourcePosition = isHorizontal ? 'right' : 'bottom';
      // unfortunately we need this little hack to pass a slightly different position in order to notify react flow about the change
      let x = nodeWithPosition.x + Math.random() / 1000
      el.position = {
        x: x - 50,
        y: nodeWithPosition.y + 20,
      };
    }
    return el;
  });
};

const nodeTypes = {
  labelNode: LabelNode,
  functionNode: FunctionNode,
  channelNode: ChannelNode,
  debugNode: DebugNode,
  deviceNode: DeviceNode
};

export default ({ initialElements, submitChanges, setChangesState, hasChanges }) => {
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

  const layoutedElements = addDagreLayoutToElements(initialElements, LEFT_RIGHT_LAYOUT)
  const originalElementsState = layoutedElements.reduce((acc, el) => Object.assign({}, acc, { [el.id]: el }), {})
  const [elementsMap, setElements] = useState(originalElementsState);

  const onElementDragStop = (event, node) => {
    const updatedNode = Object.assign({}, elementsMap[node.id], {position: {x: node.position.x, y: node.position.y}})
    setElements(elsMap => Object.assign({}, elsMap, { [node.id]: updatedNode }))
  }

  const onElementsRemove = (elementsToRemove) => {
    if (isEdge(elementsToRemove[0])) {
      setElements(elsMap => omit(elsMap, [id]))
      setChangesState(true)
    }
  }

  const onElementsAdd = ({source, target}) => {
    const id = "edge-" + source + "-" + target
    const newEdge = { id, source, target }

    setElements(elsMap => Object.assign({}, elsMap, { [id]: newEdge }))
    setChangesState(true)
  }

  const resetElementsMap = () => {
    setElements(elsMap => originalElementsState)
    setChangesState(false)
  }

  return (
    <ReactFlowProvider>
      <div ref={reactFlowWrapper} style={{ position: 'relative', height: '100%', width: '100%' }}>
        <ReactFlow
          elements={Object.values(elementsMap)}
          nodeTypes={nodeTypes}
          onLoad={onLoad}
          onElementsRemove={onElementsRemove}
          onConnect={onElementsAdd}
          onNodeDragStop={onElementDragStop}
        />
        <FlowsSettingsBar
          hasChanges={hasChanges}
          resetElementsMap={resetElementsMap}
          submitChanges={() => submitChanges(elementsMap)}
        />
      </div>
    </ReactFlowProvider>
  );
};
