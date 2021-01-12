import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import find from 'lodash/find'
import { ALL_RESOURCES } from '../../graphql/flows'
import DashboardLayout from '../common/DashboardLayout'
import FlowsWorkspace from './FlowsWorkspace'
import { Typography } from 'antd';
const { Text } = Typography

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(ALL_RESOURCES, queryOptions)
class FlowsIndex extends Component {
  state = {
    selectedNode: null
  }

  selectNode = selectedNode => this.setState({ selectedNode })

  render() {
    const { loading, error, allLabels, allFunctions, allChannels } = this.props.data
    if (loading) return (
      <DashboardLayout fullHeightWidth />
    )
    if (error) return (
      <DashboardLayout fullHeightWidth>
        <div style={{ padding: 20 }}>
          <Text>Workspace data failed to load, please reload the page and try again</Text>
        </div>
      </DashboardLayout>
    )
    const sortedAllLabels = allLabels.sort((a, b) => {
      if (a.channels.length > b.channels.length) {
        return -1
      }
      if (a.channels.length < b.channels.length) {
        return 1
      }
      if (a.function && !b.function) {
        return -1
      }
      if (!a.function && b.function) {
        return 1
      }
      return 0
    })

    const labelElements =
      sortedAllLabels
        .map(label => ({
          id: `label-${label.id}`,
          type: 'input',
          data: {
            label: `Label: ${label.name}`,
          },
          position: { x: 0, y: 0 },
        }))

    const functionElements =
      allFunctions
        .map(func => ({
          id: `function-${func.id}`,
          type: 'output',
          data: {
            label: `Function: ${func.name}`,
          },
          position: { x: 0, y: 0 },
        }))
        
    const channelElements =
      allChannels
        .map(channel => ({
          id: `channel-${channel.id}`,
          type: 'output',
          data: {
            label: `Channel: ${channel.name}`,
          },
          position: { x: 0, y: 0 },
        }))

    const labelFunctionEdgeElements =
      sortedAllLabels
        .reduce((acc, currLabel) => {
          if (currLabel.function) {
            return acc.concat({
              id: `edge-label-${currLabel.id}-function-${currLabel.function.id}`,
              source: `label-${currLabel.id}`,
              target: `function-${currLabel.function.id}`,
            })
          }
          return acc
        }, [])

    const labelChannelEdgeElements =
      sortedAllLabels
        .reduce((acc, currLabel) => {
          const edgeEls = currLabel.channels.map(channel => ({
            id: `edge-label-${currLabel.id}-channel-${channel.id}`,
            source: `label-${currLabel.id}`,
            target: `channel-${channel.id}`,
          }))
          return acc.concat(edgeEls)
        }, [])

    const elements =
      labelElements
      .concat(functionElements)
      .concat(channelElements)
      .concat(labelFunctionEdgeElements)
      .concat(labelChannelEdgeElements)

    return (
      <DashboardLayout fullHeightWidth user={this.props.user} >
        <FlowsWorkspace initialElements={elements} selectNode={this.selectNode} />
        {
          false && this.state.selectedNode && (
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
