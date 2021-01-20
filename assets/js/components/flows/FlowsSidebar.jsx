import React, { useState } from 'react';
import { Typography, Button } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import LabelNode from './LabelNode'
import FunctionNode from './FunctionNode'
import ChannelNode from './ChannelNode'
import DebugNode from './DebugNode'
const { Text } = Typography

export default ({ unconnectedNodes }) => {
  const [showUnconnectedNodes, toggleUnconnectedNodes] = useState(false)

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
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
        <Text style={{ fontSize: 16 }} strong>Unconnected Nodes</Text>
        <Button
          onClick={() => toggleUnconnectedNodes(!showUnconnectedNodes)}
          icon={showUnconnectedNodes ? <MinusOutlined /> : <PlusOutlined />}
          size="small"
        />
      </div>
      {
        showUnconnectedNodes && (
          <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 10 }}>
            <div>
              <Text strong>Labels</Text>
            </div>
            {
              unconnectedNodes.map(node => {
                return node.type == 'labelNode' && (
                  <div style={{ marginBottom: 12 }} key={node.id} draggable onDragStart={(event) => onDragStart(event, 'labelNode')}>
                    <LabelNode data={node.data} unconnected={true} />
                  </div>
                )
              })
            }
            <div>
              <Text strong>Functions</Text>
            </div>
            {
              unconnectedNodes.map(node => {
                return node.type == 'functionNode' && (
                  <div style={{ marginBottom: 12 }} key={node.id} draggable onDragStart={(event) => onDragStart(event, 'functionNode')}>
                    <FunctionNode data={node.data} unconnected={true} />
                  </div>
                )
              })
            }
            <div>
              <Text strong>Channels</Text>
            </div>
            {
              unconnectedNodes.map(node => {
                return node.type == 'channelNode' && (
                  <div style={{ marginBottom: 12 }} key={node.id} draggable onDragStart={(event) => onDragStart(event, 'channelNode')}>
                    <ChannelNode data={node.data} unconnected={true} />
                  </div>
                )
              })
            }
          </div>
        )
      }
    </div>
  );
};
