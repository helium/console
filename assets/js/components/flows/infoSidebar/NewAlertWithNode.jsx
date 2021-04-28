import React, { Fragment } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import Text from 'antd/lib/typography/Text';
import { useDispatch } from "react-redux";
import { createAlert, addAlertToNode } from '../../../actions/alert';
import AlertSettings from '../../alerts/AlertSettings';

export default (props) => {
  const dispatch = useDispatch();
  const alertType = ['device', 'group'].includes(props.nodeType) ? 'device/group' : props.nodeType;

  return (
    <Fragment>
      <Text style={{ display: 'block', fontSize: '20px', marginBottom: 5 }} strong>Create New Alert</Text>
      <AlertSettings
        alertType={alertType}
        save={(name, emailConfig, webhookConfig) => {
          dispatch(createAlert({
            name: name,
            config: {
              ...(emailConfig && { email: emailConfig }),
              ...(webhookConfig && { webhook: webhookConfig })
            },
            node_type: alertType
          })).then(data => {
            dispatch(addAlertToNode(data.data.id, props.nodeId, props.nodeType));
            props.back();
          });
        }}
        saveText="Create"
        back={props.back}
        saveIcon={<PlusOutlined />}
        cancel
      />
    </Fragment>
  );
}