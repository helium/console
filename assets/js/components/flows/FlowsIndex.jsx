import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import { isEdge, isNode } from 'react-flow-renderer';
import { Prompt } from 'react-router'
import find from 'lodash/find'
import { ALL_RESOURCES } from '../../graphql/flows'
import { updateFlows } from '../../actions/flow'
import { getIntegrationTypeForFlows } from '../../util/flows'
import DashboardLayout from '../common/DashboardLayout'
import FlowsWorkspace from './FlowsWorkspace'
import { Typography } from 'antd';
const { Text } = Typography

class FlowsIndex extends Component {
  state = {
    hasChanges: false,
  }

  setChangesState = hasChanges => {
    this.setState({ hasChanges })
  }

  submitChanges = (newElementsMap) => {
    const [completePaths, elementPositions] = getCompleteFlows(newElementsMap)

    updateFlows(completePaths, elementPositions)
    .then(status => {
      if (status == 200) {
        this.props.allResourcesQuery.refetch()
        this.setState({ hasChanges: false })
      }
    })
    .catch(err => {})
  }

  render() {
    const { loading, error } = this.props.allResourcesQuery
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

    const { organization } = this.props.allResourcesQuery.data
    const flowPositions = JSON.parse(organization.flow)
    const [initialElementsMap, nodesByType] = generateInitialElementsMap(this.props.allResourcesQuery.data, flowPositions)

    return (
      <DashboardLayout fullHeightWidth user={this.props.user} noFooter>
        <Prompt
          when={this.state.hasChanges}
          message='You have unsaved changes, are you sure you want to leave this page?'
        />
        <FlowsWorkspace
          initialElementsMap={initialElementsMap}
          submitChanges={this.submitChanges}
          setChangesState={this.setChangesState}
          hasChanges={this.state.hasChanges}
          labels={nodesByType.labels}
          channels={nodesByType.channels}
          functions={nodesByType.functions}
          devices={nodesByType.devices}
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

const getCompleteFlows = (newElementsMap) => {
  const deviceAndLabelNodes = Object.values(newElementsMap).filter(el => el.type === 'deviceNode' || el.type === 'labelNode')
  const edges = Object.values(newElementsMap).filter(el => isEdge(el))
  let paths = []

  const getPaths = (node, path) => {
    if (node.type === 'channelNode') {
      paths.push(path)
      return
    }

    edges.forEach(edge => {
      if (edge.source === node.id) {
        const nextNode = newElementsMap[edge.target]
        getPaths(nextNode, path.concat({ type: nextNode.type, id: nextNode.data.id }))
      }
    })
  }

  deviceAndLabelNodes.forEach(node => {
    getPaths(node, [{ type: node.type, id: node.data.id }])
  })

  const elementPositions = Object.keys(newElementsMap).reduce((acc, key) => {
    if (isNode(newElementsMap[key])) {
      const element = {
        position: newElementsMap[key].position
      }
      if (key.indexOf("_copy") !== -1) {
        return Object.assign({}, acc, {
          [key]: element,
          copies: acc.copies.concat(Object.assign({}, { id: key }, element))
        })
      } else {
        return Object.assign({}, acc, { [key]: element })
      }
    } else {
      const edge = {
        source: newElementsMap[key].source,
        target: newElementsMap[key].target,
      }
      return Object.assign({}, acc, { edges: acc.edges.concat(edge) })
    }
  }, { edges: [], copies: [] })

  return [paths, elementPositions]
}

const generateInitialElementsMap = (data, flowPositions) => {
  const {allLabels, allFunctions, allChannels, allDevices} = data
  let initialElementsMap = {}
  const labels = []
  const devices = []
  const functions = []
  const channels = []

  allDevices.forEach(device => {
    const node = {
      id: `device-${device.id}`,
      type: 'deviceNode',
      data: {
        label: device.name,
        id: `device-${device.id}`,
        adrAllowed: device.adr_allowed,
        multi_buy_id: device.multi_buy_id,
      },
      position: [0,0]
    }
    devices.push(node)

    if (flowPositions[`device-${device.id}`]) {
      initialElementsMap[`device-${device.id}`] = node
      node.position = flowPositions[`device-${device.id}`].position
    }
  })
  allLabels.forEach(label => {
    const node = {
      id: `label-${label.id}`,
      type: 'labelNode',
      data: {
        label: label.name,
        id: `label-${label.id}`,
        deviceCount: label.device_count,
        adrAllowed: label.adr_allowed,
        multi_buy_id: label.multi_buy_id,
      },
      position: [0,0]
    }
    labels.push(node)

    if (flowPositions[`label-${label.id}`]) {
      initialElementsMap[`label-${label.id}`] = node
      node.position = flowPositions[`label-${label.id}`].position
    }
  })
  allFunctions.forEach(func => {
    const node = {
      id: `function-${func.id}`,
      type: 'functionNode',
      data: {
        label: func.name,
        id: `function-${func.id}`,
        format: func.format
      },
      position: [0,0]
    }
    functions.push(node)

    if (flowPositions[`function-${func.id}`]) {
      initialElementsMap[`function-${func.id}`] = node
      node.position = flowPositions[`function-${func.id}`].position
    }
  })
  allChannels.forEach(channel => {
    const type = getIntegrationTypeForFlows(channel.endpoint, channel.type)

    const node = {
      id: `channel-${channel.id}`,
      type: 'channelNode',
      data: {
        label: channel.name,
        id: `channel-${channel.id}`,
        type_name: channel.type_name,
        type,
      },
      position: [0,0],
    }
    channels.push(node)
    if (flowPositions[`channel-${channel.id}`]) {
      initialElementsMap[`channel-${channel.id}`] = node
      node.position = flowPositions[`channel-${channel.id}`].position
    }
  })

  // currently only function nodes can be duplicated
  flowPositions.copies && flowPositions.copies.map(copiedNode => {
    const originalId = copiedNode.id.slice(0, copiedNode.id.indexOf("_copy"))
    const func = initialElementsMap[originalId]

    if (func) {
      const node = {
        id: copiedNode.id,
        type: 'functionNode',
        data: {
          label: func.data.label,
          id: `function-${func.data.id}`,
          format: func.data.format
        },
        position: [0,0]
      }

      if (flowPositions[copiedNode.id]) {
        initialElementsMap[copiedNode.id] = node
        node.position = flowPositions[copiedNode.id].position
      }
    }
  })

  flowPositions.edges && flowPositions.edges.forEach(edge => {
    if (initialElementsMap[edge.source] && initialElementsMap[edge.target]) {
      const id = "edge-" + edge.source + "-" + edge.target
      const element = { id, source: edge.source, target: edge.target }
      initialElementsMap[id] = element
    }
  })
  return [initialElementsMap, { labels, devices, functions, channels }]
}

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
  }
}

export default connect(mapStateToProps, null)(
  withGql(FlowsIndex, ALL_RESOURCES, props => ({ fetchPolicy: 'network-only', variables: {id: props.currentOrganizationId}, name: 'allResourcesQuery' }))
)
