import React, { useState } from 'react';
import { Typography, Button } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import LabelNode from './nodes/LabelNode'
import FunctionNode from './nodes/FunctionNode'
import ChannelNode from './nodes/ChannelNode'
import DeviceNode from './nodes/DeviceNode'
import DebugNode from './nodes/DebugNode'
const { Text } = Typography

export default ({ devices, labels, functions, channels }) => {
  const [showMenu, toggleMenu] = useState(false)

  const onDragStart = (event, node) => {
    event.dataTransfer.setData('node/id', node.id)
    event.dataTransfer.setData('node/type', node.type)
    event.dataTransfer.setData('node/name', node.data.label)

    if (node.type == 'channelNode') {
      event.dataTransfer.setData('node/channel_type_name', node.data.type_name)
      event.dataTransfer.setData('node/channel_type', node.data.type)
    }

    if (node.type == 'functionNode') {
      event.dataTransfer.setData('node/function_format', node.data.format)
    }

    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: '#f7f8fa',
      zIndex: 100,
      minWidth: 250,
      padding: 10,
      maxHeight: 'calc(100vh - 55px)',
      overflowY: 'scroll'
    }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }} strong>All Nodes</Text>
        <Button
          onClick={() => toggleMenu(!showMenu)}
          icon={showMenu ? <MinusOutlined /> : <PlusOutlined />}
          size="small"
        />
      </div>
      {
        showMenu && (
          <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 10 }}>
            <div>
              <Text strong>Labels</Text>
            </div>
            {
              labels.map(node => (
                <div style={{ marginBottom: 12 }} key={node.id} draggable onDragStart={(event) => onDragStart(event, node)}>
                  <LabelNode data={node.data} unconnected={true} />
                </div>
              ))
            }
            <div>
              <Text strong>Devices</Text>
            </div>
            {
              devices.map(node => (
                <div style={{ marginBottom: 12 }} key={node.id} draggable onDragStart={(event) => onDragStart(event, node)}>
                  <DeviceNode data={node.data} unconnected={true} />
                </div>
              ))
            }
            <div>
              <Text strong>Functions</Text>
            </div>
            {
              functions.map(node => (
                <div style={{ marginBottom: 12 }} key={node.id} draggable onDragStart={(event) => onDragStart(event, node)}>
                  <FunctionNode data={node.data} unconnected={true} />
                </div>
              ))
            }
            <div>
              <Text strong>Integrations</Text>
            </div>
            {
              channels.map(node => (
                <div style={{ marginBottom: 12 }} key={node.id} draggable onDragStart={(event) => onDragStart(event, node)}>
                  <ChannelNode data={node.data} unconnected={true} />
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
};
