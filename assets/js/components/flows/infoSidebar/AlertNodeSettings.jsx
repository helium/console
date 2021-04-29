import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ALERTS_PER_TYPE, ALERTS_FOR_NODE } from '../../../graphql/alerts';
import { useQuery } from '@apollo/client';
import { Button, Switch, Table } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import UserCan from '../../common/UserCan';
import { SkeletonLayout } from '../../common/SkeletonLayout';
import { Link } from 'react-router-dom';
import { addAlertToNode, removeAlertFromNode } from '../../../actions/alert';
import { useDispatch } from "react-redux";
import NewAlertWithNode from './NewAlertWithNode';

export default (props) => {
  const { loading, error, data, refetch } = useQuery(ALERTS_PER_TYPE, {
    variables: { type: ['device', 'group'].includes(props.type) ? 'device/group' : props.type },
    skip: !props.type,
    fetchPolicy: 'cache-and-network'
  });
  const { loading: alertsForNodeLoading, error: alertsForNodeError, data: alertsForNodeData, refetch: alertsForNodeRefetch } = useQuery(ALERTS_FOR_NODE, {
    variables: { node_id: props.nodeId, node_type: props.type },
    skip: !props.type || !props.nodeId,
    fetchPolicy: 'cache-and-network'
  });
  const alertsData = data ? data.alertsPerType : [];
  const nodeAlerts = alertsForNodeData ? alertsForNodeData.alertsForNode : [];
  const socket = useSelector(state => state.apollo.socket);
  const alertsChannel = socket.channel("graphql:alerts_index_table", {});
  const nodeAlertsChannels = socket.channel("graphql:alert_settings_table", {});
  const currentOrganizationId = useSelector(state => state.organization.currentOrganizationId);
  const dispatch = useDispatch();
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    // executed when mounted
    alertsChannel.join();
    alertsChannel.on(`graphql:alerts_index_table:${currentOrganizationId}:alert_list_update`, (_message) => {
      refetch();
    })

    // executed when unmounted
    return () => {
      alertsChannel.leave();
    }
  });

  useEffect(() => {
    // executed when mounted
    nodeAlertsChannels.join();
    nodeAlertsChannels.on(`graphql:alert_settings_table:${props.type}-${props.nodeId}:alert_settings_update`, (_message) => {
      alertsForNodeRefetch();
    })

    // executed when unmounted
    return () => {
      nodeAlertsChannels.leave();
    }
  });

  if (loading || alertsForNodeLoading) return(<div><SkeletonLayout /></div>);
  if (error || alertsForNodeError) return(<div><Text>Data failed to load, please reload the page and try again</Text></div>);

  const renderAllAlerts = () => (
    <div>
      <Table
        dataSource={alertsData}
        rowKey={record => record.id}
        pagination={false}
        columns={[
          {
            title: '',
            dataIndex: 'name',
            render: (data, record) => (
              <Link to={`/alerts/${record.id}`}>{data}</Link>
            )
          },
          {
            title: '',
            dataIndex: '',
            render: (text, record) => (
              <UserCan>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                  <Switch
                    checked={nodeAlerts && nodeAlerts.findIndex(alert => alert.id === record.id) !== -1}
                    onChange={(checked) => {
                      if (checked) {
                        dispatch(addAlertToNode(record.id, props.nodeId, props.type));
                      } else {
                        dispatch(removeAlertFromNode(record.id, props.nodeId, props.type));
                      }
                    }}
                  />
                </div>
              </UserCan>
            )
          }
        ]}
      />
      <Button
        icon={<BellOutlined />}
        style={{ borderRadius: 4, marginTop: 40, marginLeft: 40 }}
        onClick={() => { setShowNew(true) }}
      >
        Create New Alert
      </Button>
    </div>
  )

  return(
    <React.Fragment>
      { !showNew && renderAllAlerts() }
      { showNew && <NewAlertWithNode nodeId={props.nodeId} nodeType={props.type} back={() => { setShowNew(false)}} /> }
    </React.Fragment>
  );
}
