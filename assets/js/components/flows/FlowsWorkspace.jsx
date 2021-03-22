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

export default ({ initialElementsMap, submitChanges, setChangesState, hasChanges, labels, functions, channels, devices }) => {
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

  const onDragOver = event => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const onDrop = event => {
    event.preventDefault()
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
    const id = event.dataTransfer.getData('node/id')
    const type = event.dataTransfer.getData('node/type')
    const name = event.dataTransfer.getData('node/name')

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left - 75,
      y: event.clientY - reactFlowBounds.top,
    })

    let data = { label: name, id }
    if (type == 'channelNode') {
      data = Object.assign({}, data, {
        type_name: event.dataTransfer.getData('node/channel_type_name'),
        type: event.dataTransfer.getData('node/channel_type')
      })
    }

    if (type == 'functionNode') {
      data = Object.assign({}, data, {
        format: event.dataTransfer.getData('node/function_format'),
      })
    }

    const newNode = { id, type, position, data }
    setElements(elsMap => Object.assign({}, elsMap, { [id]: newNode }))
    setChangesState(true)
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
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
        <FlowsSidebar
          labels={labels}
          functions={functions}
          channels={channels}
          devices={devices}
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
