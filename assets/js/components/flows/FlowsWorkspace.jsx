import React, { useState, useRef } from 'react';
import ReactFlow, { ReactFlowProvider, isNode, removeElements, addEdge } from 'react-flow-renderer';
import findIndex from 'lodash/findIndex'
import FlowsSidebar from './FlowsSidebar'
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

export default ({ initialElements, selectNode, unconnectedChannels, unconnectedFunctions, unconnectedLabels }) => {
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

  const layoutedElements = addDagreLayoutToElements(initialElements, LEFT_RIGHT_LAYOUT)
  const [elementsMap, setElements] = useState(layoutedElements.reduce((acc, el) => Object.assign({}, acc, { [el.id]: el }), {}));

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
        />
        <FlowsSidebar
          unconnectedLabels={unconnectedLabels}
          unconnectedFunctions={unconnectedFunctions}
          unconnectedChannels={unconnectedChannels} 
          elementsMap={elementsMap}
        />
      </div>
    </ReactFlowProvider>
  );
};
