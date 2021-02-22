import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { Prompt } from 'react-router'
import find from 'lodash/find'
import { ALL_RESOURCES } from '../../graphql/flows'
import { updateEdges } from '../../actions/flows'
import DashboardLayout from '../common/DashboardLayout'
import FlowsWorkspace from './FlowsWorkspace'
import { Typography } from 'antd';
const { Text } = Typography

class FlowsIndex extends Component {
  state = {
    selectedNode: null,
    hasChanges: false,
  }

  selectNode = selectedNode => this.setState({ selectedNode })

  setChangesState = hasChanges => {
    this.setState({ hasChanges })
  }

  submitChanges = (edgesToRemove, edgesToAdd) => {
    const removeEdges =
      Object.values(edgesToRemove).map(edge => {
        if (edge.target[0] === 'c') {
          return {
            source: edge.source.slice(6),
            target: edge.target.slice(8),
            type: "channel",
          }
        }
        if (edge.target[0] === 'f') {
          return {
            source: edge.source.slice(6),
            target: edge.target.slice(9),
            type: "function",
          }
        }
      })

    const addEdges = Object.values(edgesToAdd).map(edge => {
      if (edge.target[0] === 'c') {
        return {
          source: edge.source.slice(6),
          target: edge.target.slice(8),
          type: "channel",
        }
      }
      if (edge.target[0] === 'f') {
        return {
          source: edge.source.slice(6),
          target: edge.target.slice(9),
          type: "function",
        }
      }
    })

    updateEdges(removeEdges, addEdges)
    .then(status => {
      if (status == 200) {
        const { fetchMore } = this.props.allResourcesQuery
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
    .catch(err => {})
  }

  render() {
    const { loading, error, allLabels, allFunctions, allChannels } = this.props.allResourcesQuery
    if (loading) return (
      <DashboardLayout fullHeightWidth user={this.props.user} />
    )
    if (error) return (
      <DashboardLayout fullHeightWidth user={this.props.user}>
        <div style={{ padding: 20 }}>
          <Text>Workspace data failed to load, please reload the page and try again</Text>
        </div>
      </DashboardLayout>
    )

    const sortedAllLabels = allLabels.slice().sort((a, b) => {
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

    const unconnectedLabels =
      allLabels
      .filter(node => {
        return !connectedNodeSet[`label-${node.id}`]
      })
      .map(node => ({
        id: `label-${node.id}`,
        type: 'labelNode',
        data: {
          label: node.name,
        }
      }))

    const unconnectedFunctions =
      allFunctions
      .filter(node => {
        return !connectedNodeSet[`function-${node.id}`]
      })
      .map(node => ({
        id: `function-${node.id}`,
        type: 'functionNode',
        data: {
          label: node.name,
          format: node.format
        }
      }))

    const unconnectedChannels =
      allChannels
      .filter(node => {
        return !connectedNodeSet[`channel-${node.id}`]
      })
      .map(node => ({
        id: `channel-${node.id}`,
        type: 'channelNode',
        data: {
          label: node.name,
          type_name: node.type_name,
          type: node.type
        }
      }))

    return (
      <DashboardLayout fullHeightWidth user={this.props.user} >
        <Prompt
          when={this.state.hasChanges}
          message='You have unsaved changes, are you sure you want to leave this page?'
        />
        <FlowsWorkspace
          initialElements={elements}
          selectNode={this.selectNode}
          unconnectedLabels={unconnectedLabels}
          unconnectedFunctions={unconnectedFunctions}
          unconnectedChannels={unconnectedChannels}
          submitChanges={this.submitChanges}
          setChangesState={this.setChangesState}
          hasChanges={this.state.hasChanges}
        />
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

export default withGql(FlowsIndex, ALL_RESOURCES, props => ({ fetchPolicy: 'network-only', variables: {}, name: 'allResourcesQuery' }))
