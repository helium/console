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

const nodeTypes = {
  labelNode: LabelNode,
  functionNode: FunctionNode,
  channelNode: ChannelNode,
  debugNode: DebugNode,
  deviceNode: DeviceNode
};

export default ({ initialElementsMap, submitChanges, setChangesState, hasChanges }) => {
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

  const [elementsMap, setElements] = useState(initialElementsMap);

  const onElementDragStop = (event, node) => {
    const updatedNode = Object.assign({}, elementsMap[node.id], {position: {x: node.position.x, y: node.position.y}})
    setElements(elsMap => Object.assign({}, elsMap, { [node.id]: updatedNode }))
    setChangesState(true)
  }

  const onElementsRemove = (elementsToRemove) => {
    if (isEdge(elementsToRemove[0])) {
      setElements(elsMap => omit(elsMap, [elementsToRemove[0].id]))
    }
    if (isNode(elementsToRemove[0])) {
      const edges =
        Object.values(elementsMap)
        .filter(el => isEdge(el) && (el.source === elementsToRemove[0].id || el.target === elementsToRemove[0].id))
        .map(el => el.id)

      setElements(elsMap => omit(elsMap, edges.concat(elementsToRemove[0].id)))
    }
    setChangesState(true)
  }

  const onElementsAdd = ({source, target}) => {
    const id = "edge-" + source + "-" + target
    const newEdge = { id, source, target }

    setElements(elsMap => Object.assign({}, elsMap, { [id]: newEdge }))
    setChangesState(true)
  }

  const resetElementsMap = () => {
    setElements(elsMap => initialElementsMap)
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
