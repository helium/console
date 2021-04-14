import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import { Card, Typography } from 'antd';
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography
import { FLOWS_BY_DEVICE } from '../../graphql/flows'
import FlowsLayout from '../common/FlowsLayout';

class DeviceFlows extends Component {
refetchEntries = () => {
  const { refetch } = this.props.deviceFlowsQuery;
  refetch();
}

componentDidMount() {
    const { currentOrganizationId, socket } = this.props;

    this.channel = socket.channel("graphql:flows_update", {});
    this.channel.join();
    this.channel.on(`graphql:flows_update:${currentOrganizationId}:organization_flows_update`, (message) => {
      this.refetchEntries();
    })
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  addCopyIfNodeExisting = (nodeId, existingElements) => {
    if (nodeId in existingElements) {
      let i = 1;
      while (existingElements[nodeId + "_copy" + i]) {
        i++;
      }
      return `${nodeId}_copy${i}`;
    } else {
      return nodeId;
    }
  }

  generateElements = (flows) => {
    let elements = {};

    flows.forEach(f => {
      const functionId = f.function_id;
      const channelId = f.channel_id;
      const deviceId = f.device_id || this.props.deviceId;
      const labelId = f.label_id;

      let functionNodeId = `function-${functionId}`;
      functionNodeId = this.addCopyIfNodeExisting(functionNodeId, elements);

      let channelNodeId = `channel-${channelId}`;
      channelNodeId = this.addCopyIfNodeExisting(channelNodeId, elements);

      let deviceNodeId = `device-${deviceId}`;
      deviceNodeId = this.addCopyIfNodeExisting(deviceNodeId, elements);

      let labelNodeId = `label-${labelId}`;
      labelNodeId = this.addCopyIfNodeExisting(labelNodeId, elements);

      elements[channelNodeId] = {
        id: channelNodeId,
        data: {
          label: channelId
        },
        position: [0,0],
        type: 'channelNode'
      };

      if (functionId) {
        elements[functionNodeId] = {
          id: functionNodeId,
          data: {
            label: functionId
          },
          position: [0,0],
          type: 'functionNode'
        };
        const edgeNodeId = `edge-${functionNodeId}-${channelNodeId}`;
        elements[edgeNodeId] = {
          id: edgeNodeId, 
          source: functionNodeId, 
          target: channelNodeId
        };
      }

      if (labelId) {
        elements[deviceNodeId] ={
          id: deviceNodeId,
          data: {
            label: deviceId
          },
          position: [0,0],
          type: 'deviceNode'
        };
        elements[labelNodeId] = {
          id: labelNodeId,
          data: {
            label: labelId
          },
          position: [0,0],
          type: 'labelNode'
        };
        
        const edgeNodeId = `edge-${deviceNodeId}-${labelNodeId}`;
        elements[edgeNodeId] = {
          id: edgeNodeId, 
          source: deviceNodeId, 
          target: labelNodeId
        };

        if (functionId) {
          const edgeNodeId = `edge-${labelNodeId}-${functionNodeId}`;
          elements[edgeNodeId] = {
            id: edgeNodeId, 
            source: labelNodeId, 
            target: functionNodeId
          };
        } else {
          const edgeNodeId = `edge-${labelNodeId}-${channelNodeId}`;
          elements[edgeNodeId] = {
            id: edgeNodeId, 
            source: labelNodeId, 
            target: channelNodeId
          };
        }
      } else {
        elements[deviceNodeId] = {
          id: deviceNodeId,
          data: {
            label: deviceId
          },
          position: [0,0],
          type: 'deviceNode'
        };

        if (functionId) {
          const edgeNodeId = `edge-${deviceNodeId}-${functionNodeId}`;
          elements[edgeNodeId] = {
            id: edgeNodeId, 
            source: deviceNodeId, 
            target: functionNodeId
          };
        } else {
          const edgeNodeId = `edge-${deviceNodeId}-${channelNodeId}`;
          elements[edgeNodeId] = {
            id: edgeNodeId, 
            source: deviceNodeId, 
            target: channelNodeId
          };
        }
      }
    });

    return Object.values(elements);
  }

  render() {
    const { loading, error } = this.props.deviceFlowsQuery;

    if (loading) return <SkeletonLayout />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    );

    const { flowsByDevice } = this.props.deviceFlowsQuery.data;
    const elements = this.generateElements(flowsByDevice);

    return (
      <Card bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }} title='Flows'>
        <FlowsLayout elements={elements} />
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket,
    currentOrganizationId: state.organization.currentOrganizationId
  };
}

export default connect(mapStateToProps, null)(
  withGql(DeviceFlows, FLOWS_BY_DEVICE, props => ({ fetchPolicy: 'cache-first', variables: { deviceId: props.deviceId }, name: 'deviceFlowsQuery' }))
)
