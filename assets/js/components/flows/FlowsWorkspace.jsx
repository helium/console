import React, { useState, useRef, Fragment } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  isNode,
  isEdge
} from 'react-flow-renderer';
import omit from 'lodash/omit'
import FlowsSidebar from './FlowsSidebar'
import FlowsSettingsBar from './FlowsSettingsBar'
import LabelNode from './nodes/LabelNode'
import FunctionNode from './nodes/FunctionNode'
import ChannelNode from './nodes/ChannelNode'
import DebugNode from './nodes/DebugNode'
import DeviceNode from './nodes/DeviceNode'
import InfoSidebar from './infoSidebar/InfoSidebar';
import NodeInfo from './infoSidebar/NodeInfo';
import analyticsLogger from '../../util/analyticsLogger'

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
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

  const [elementsMap, setElements] = useState(initialElementsMap);

  const onElementDragStop = (event, node) => {
    const updatedNode = Object.assign({}, elementsMap[node.id], {position: {x: node.position.x, y: node.position.y}})
    setElements(elsMap => Object.assign({}, elsMap, { [node.id]: updatedNode }))
    setChangesState(true)
  }

  const onElementsRemove = (elementsToRemove) => {
    if (!elementsToRemove[0]) return

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
    if (type === 'channelNode') {
      data = Object.assign({}, data, {
        type_name: event.dataTransfer.getData('node/channel_type_name'),
        type: event.dataTransfer.getData('node/channel_type')
      })
    }

    if (type === 'functionNode') {
      data = Object.assign({}, data, {
        format: event.dataTransfer.getData('node/function_format'),
      })
    }

    if (type === 'labelNode') {
      data = Object.assign({}, data, {
        deviceCount: event.dataTransfer.getData('node/label_device_count'),
      })
    }

    const newNode = { id, type, position, data }

    if (type === 'functionNode' && elementsMap[id]) {
      let i = 1
      while (elementsMap[id + "_copy" + i]) {
        i ++
      }
      newNode.id = id + "_copy" + i
    }

    setElements(elsMap => Object.assign({}, elsMap, { [newNode.id]: newNode }))
    setChangesState(true)
  }

  const handleToggleSidebar = () => {
    if (!showInfoSidebar) {
      analyticsLogger.logEvent("ACTION_OPEN_NODE_INFO_SIDEBAR", { "id": selectedNodeId })
    } else {
      analyticsLogger.logEvent("ACTION_CLOSE_NODE_INFO_SIDEBAR", { "id": selectedNodeId })
    }

    setShowInfoSidebar(!showInfoSidebar);
  }

  return (
    <Fragment>
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
            onSelectionChange={elements => {
              if (elements && elements.length === 1 && elements[0].type !== 'default') {
                setShowInfoSidebar(true);
                setSelectedNodeId(elements[0].id);
              }
            }}
            selectNodesOnDrag={false}
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
        <InfoSidebar
          show={showInfoSidebar}
          width={500}
          toggle={handleToggleSidebar}
        >
          <NodeInfo
            id={selectedNodeId && selectedNodeId.split(/-(.+)/)[1].split('_copy')[0]}
            type={selectedNodeId && selectedNodeId.split(/-(.+)/)[0].replace('-', '')}
          />
        </InfoSidebar>
      </ReactFlowProvider>
    </Fragment>
  );
};
