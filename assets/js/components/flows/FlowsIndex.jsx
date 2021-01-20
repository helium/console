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
        .reduce((acc, label) => {
          if (label.function || label.channels.length > 0) return acc.concat(
            {
              id: `label-${label.id}`,
              type: 'labelNode',
              data: {
                label: label.name,
              },
              position: { x: 0, y: 0 },
            }
          )
          return acc
        }, [])

    const functionElements =
      sortedAllLabels
        .reduce((acc, label) => {
          if (label.function) return acc.concat(
            {
              id: `function-${label.function.id}`,
              type: 'functionNode',
              data: {
                label: label.function.name,
                format: label.function.format
              },
              position: { x: 0, y: 0 },
            }
          )
          return acc
        }, [])

    const channelElements = Object.values(
      sortedAllLabels
        .reduce((acc, label) => {
          if (label.channels) return acc.concat(label.channels)
          return acc
        }, [])
        .reduce((acc, channel) => {
          return Object.assign({}, acc, {
            [channel.id]: {
              id: `channel-${channel.id}`,
              type: 'channelNode',
              data: {
                label: channel.name,
                type_name: channel.type_name,
                type: channel.type
              },
              position: { x: 0, y: 0 },
            }
          })
        }, {})
    )

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

    const connectedNodeSet =
      labelFunctionEdgeElements.concat(labelChannelEdgeElements)
      .reduce((acc, edge) => {
        return Object.assign({} , acc, { [edge.source]: true, [edge.target]: true })
      }, {})

    const unconnectedNodes =
      allLabels.concat(allFunctions).concat(allChannels)
      .filter(node => {
        return !connectedNodeSet[`label-${node.id}`] && !connectedNodeSet[`function-${node.id}`] && !connectedNodeSet[`channel-${node.id}`]
      })
      .map(node => {
        if (node.__typename == 'Label') {
          return {
            id: `label-${node.id}`,
            type: 'labelNode',
            data: {
              label: node.name,
            },
          }
        }
        if (node.__typename == 'Channel') {
          return {
            id: `channel-${node.id}`,
            type: 'channelNode',
            data: {
              label: node.name,
              type_name: node.type_name,
              type: node.type
            },
          }
        }
        if (node.__typename == 'Function') {
          return {
            id: `function-${node.id}`,
            type: 'functionNode',
            data: {
              label: node.name,
              format: node.format
            },
          }
        }
      })

    return (
      <DashboardLayout fullHeightWidth user={this.props.user} >
        <FlowsWorkspace initialElements={elements} selectNode={this.selectNode} unconnectedNodes={unconnectedNodes} />
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
