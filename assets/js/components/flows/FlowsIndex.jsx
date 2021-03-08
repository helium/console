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
    hasChanges: false,
  }

  setChangesState = hasChanges => {
    this.setState({ hasChanges })
  }

  submitChanges = (edgesToRemove, edgesToAdd) => {
    // updateEdges(removeEdges, addEdges)
    // .then(status => {
    //   if (status == 200) {
    //     this.props.allResourcesQuery.refetch()
    //   }
    // })
    // .catch(err => {})
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
    const { allLabels, allFunctions, allChannels, allDevices } = this.props.allResourcesQuery.data

    const deviceElements =
      allDevices
        .reduce((acc, device) => {
          return acc.concat(
            {
              id: `device-${device.id}`,
              type: 'deviceNode',
              data: {
                label: device.name,
              },
              position: { x: 0, y: 0 },
            }
          )
        }, [])

    const labelElements =
      allLabels
        .reduce((acc, label) => {
          return acc.concat(
            {
              id: `label-${label.id}`,
              type: 'labelNode',
              data: {
                label: label.name,
              },
              position: { x: 0, y: 0 },
            }
          )
        }, [])

    const functionElements =
      allFunctions
        .reduce((acc, func) => {
          return acc.concat(
            {
              id: `function-${func.id}`,
              type: 'functionNode',
              data: {
                label: func.name,
                format: func.format
              },
              position: { x: 0, y: 0 },
            }
          )
        }, [])

    const channelElements =
      allChannels
        .reduce((acc, channel) => {
          return acc.concat(
            {
              id: `channel-${channel.id}`,
              type: 'channelNode',
              data: {
                label: channel.name,
                type_name: channel.type_name,
                type: channel.type
              },
              position: { x: 0, y: 0 },
            }
          )
        }, [])

    const elements =
      labelElements
      .concat(deviceElements)
      .concat(functionElements)
      .concat(channelElements)

    return (
      <DashboardLayout fullHeightWidth user={this.props.user} >
        <Prompt
          when={this.state.hasChanges}
          message='You have unsaved changes, are you sure you want to leave this page?'
        />
        <FlowsWorkspace
          initialElements={elements}
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
