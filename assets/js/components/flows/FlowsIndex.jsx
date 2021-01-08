import React, { Component } from 'react'
import ReactFlow from 'react-flow-renderer';
import DashboardLayout from '../common/DashboardLayout'
import { Typography, Card } from 'antd';
const { Text } = Typography

class FlowsIndex extends Component {
  render() {
    const elements = [
      { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
      { id: '2', data: { label: <div>Node 2</div> }, position: { x: 100, y: 100 } },
      { id: 'e1-2', source: '1', target: '2', animated: true },
    ];

    return (
      <DashboardLayout fullHeightWidth user={this.props.user} >
        <ReactFlow elements={elements} />
      </DashboardLayout>
    )
  }
}

export default FlowsIndex
