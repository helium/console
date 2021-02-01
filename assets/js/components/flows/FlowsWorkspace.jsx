import React, { useState, useRef } from 'react';
import ReactFlow, { ReactFlowProvider, isNode, isEdge, removeElements, addEdge, getOutgoers } from 'react-flow-renderer';
import findIndex from 'lodash/findIndex'
import find from 'lodash/find'
import omit from 'lodash/omit'
import FlowsSidebar from './FlowsSidebar'
import FlowsSettingsBar from './FlowsSettingsBar'
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

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = isHorizontal ? 'left' : 'top';
      el.sourcePosition = isHorizontal ? 'right' : 'bottom';
      // unfortunately we need this little hack to pass a slightly different position in order to notify react flow about the change
      let x = nodeWithPosition.x + Math.random() / 1000
      if (el.type == 'channelNode') x += 250
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
  debugNode: DebugNode
};

export default ({ initialElements, selectNode, unconnectedChannels, unconnectedFunctions, unconnectedLabels, submitChanges }) => {
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

  const layoutedElements = addDagreLayoutToElements(initialElements, LEFT_RIGHT_LAYOUT)
  const originalElementsState = layoutedElements.reduce((acc, el) => Object.assign({}, acc, { [el.id]: el }), {})
  const [elementsMap, setElements] = useState(originalElementsState);

  const [edgesToRemove, updateEdgeMapRemove] = useState({})
  const [edgesToAdd, updateEdgeMapAdd] = useState({})
  const [nodeDroppedIn, updateNodeDroppedIn] = useState(false)

  // const onElementClick = (e, el) => selectNode(el)

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
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    })

    let data = { label: name }
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
    updateNodeDroppedIn(true)
  }

  const onElementsRemove = (elementsToRemove) => {
    if (isEdge(elementsToRemove[0])) {
      const id = elementsToRemove[0].id

      if (originalElementsState[id] && elementsMap[id]) {
        setElements(elsMap => omit(elsMap, [id]))
        updateEdgeMapRemove(edgeMap => Object.assign({}, edgeMap, { [id]: elementsToRemove[0] }))
      }
      if (!originalElementsState[id] && elementsMap[id]) {
        setElements(elsMap => omit(elsMap, [id]))
        updateEdgeMapAdd(edgeMap => omit(edgeMap, [id]))
      }
    }
  }

  const onElementsAdd = ({ source, target }) => {
    const id = "edge-" + source + "-" + target
    const newEdge = { id, source, target }

    if (target[0] === 'f' && !elementsMap[id]) {
      const existingFunctionNode =
        getOutgoers(elementsMap[source], Object.values(elementsMap))
        .find(node => node.type === 'functionNode')

      if (existingFunctionNode) {
        const existingFunctionEdgeId = "edge-" + source + "-" + existingFunctionNode.id

        setElements(elsMap => omit(elsMap, [existingFunctionEdgeId]))
        updateEdgeMapAdd(edgeMap => omit(edgeMap, [existingFunctionEdgeId]))
        if (originalElementsState[existingFunctionEdgeId]) {
          updateEdgeMapRemove(edgeMap => Object.assign({}, edgeMap, { [existingFunctionEdgeId]: originalElementsState[existingFunctionEdgeId] }))
        }
      }
    }

    if (!originalElementsState[id] && !elementsMap[id]) {
      setElements(elsMap => Object.assign({}, elsMap, { [id]: newEdge }))
      updateEdgeMapAdd(edgeMap => Object.assign({}, edgeMap, { [newEdge.id]: newEdge }))
    }
    if (originalElementsState[id] && !elementsMap[id]) {
      setElements(elsMap => Object.assign({}, elsMap, { [id]: newEdge }))
      updateEdgeMapRemove(edgeMap => omit(edgeMap, [newEdge.id]))
    }
  }

  const resetElementsMap = () => {
    setElements(elsMap => originalElementsState)
    updateEdgeMapRemove(edgeMap => ({}))
    updateEdgeMapAdd(edgeMap => ({}))
    updateNodeDroppedIn(false)
  }

  return (
    <ReactFlowProvider>
      <div ref={reactFlowWrapper} style={{ position: 'relative', height: '100%', width: '100%' }}>
        <ReactFlow
          elements={Object.values(elementsMap)}
          nodeTypes={nodeTypes}
          onLoad={onLoad}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onElementsRemove={onElementsRemove}
          onConnect={onElementsAdd}
        />
        <FlowsSidebar
          unconnectedLabels={unconnectedLabels}
          unconnectedFunctions={unconnectedFunctions}
          unconnectedChannels={unconnectedChannels}
          elementsMap={elementsMap}
        />
        <FlowsSettingsBar
          edgesToRemove={edgesToRemove}
          edgesToAdd={edgesToAdd}
          nodeDroppedIn={nodeDroppedIn}
          resetElementsMap={resetElementsMap}
          submitChanges={() => submitChanges(edgesToRemove, edgesToAdd)}
        />
      </div>
    </ReactFlowProvider>
  );
};
