import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import FlowsWorkspace from './FlowsWorkspace'

class FlowsIndex extends Component {
  state = {
    selectedNode: null
  }

  selectNode = selectedNode => this.setState({ selectedNode })

  render() {
    const elements = [
      {
        id: '1',
        data: { label: 'Input Node' },
        position: { x: 250, y: 25 },
      },
      {
        id: '2',
        data: { label: 'Another Node' },
        position: { x: 100, y: 125 },
      },
    ];

    return (
      <DashboardLayout fullHeightWidth user={this.props.user} >
        <FlowsWorkspace initialElements={elements} selectNode={this.selectNode} />
        {
          this.state.selectedNode && (
            <div style={{
              backgroundColor: 'red',
              position: 'absolute',
              height: 'calc(100% - 135px)',
              width: 300,
              top: 95,
              right: 40,
              zIndex: 100
            }} />
          )
        }
      </DashboardLayout>
    )
  }
}

export default FlowsIndex
