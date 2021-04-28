import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Row, Col } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import AddDeviceAlertIcon from '../../../img/alerts/device-group-alert-add-icon.svg';
import AddFunctionAlertIcon from '../../../img/alerts/function-alert-add-icon.svg';
import AddIntegrationAlertIcon from '../../../img/alerts/channel-alert-add-icon.svg';
import Text from 'antd/lib/typography/Text';
import { useDispatch } from "react-redux";
import { createAlert, updateAlert } from '../../actions/alert';
import AlertSettings from './AlertSettings';
import { ALERT_SHOW } from '../../graphql/alerts';
import { useQuery } from '@apollo/client';
import { SkeletonLayout } from '../common/SkeletonLayout';
import DeleteAlertModal from './DeleteAlertModal';

export default (props) => {
  const [showDeleteAlertModal, setShowDeleteAlertModal] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, data, refetch } = useQuery(ALERT_SHOW, {
    variables: { id: props.id },
    skip: !props.id
  });
  const socket = useSelector(state => state.apollo.socket);
  const alertType = props.show && data && data.alert ? data.alert.node_type : props.alertType;

  useEffect(() => {
    if (props.show) {
      const alertShowChannel = socket.channel("graphql:alert_show", {});

      // executed when mounted
      alertShowChannel.join();
      alertShowChannel.on(`graphql:alert_show:${props.id}:alert_update`, (_message) => {
        refetch();
      })

      // executed when unmounted
      return () => {
        alertShowChannel.leave();
      }
    }
  }, []);

  if (loading) return <SkeletonLayout />;
  if (error) return <Text>Data failed to load, please reload the page and try again</Text>;

  const renderIcon = () => {
    const ICONS = {
      'device/group': AddDeviceAlertIcon,
      'function': AddFunctionAlertIcon,
      'integration': AddIntegrationAlertIcon
    }
    return ICONS[alertType];
  }

  const openDeleteAlertModal = () => {
    setShowDeleteAlertModal(true);
  }

  const closeDeleteAlertModal = () => {
    setShowDeleteAlertModal(false);
    props.back();
  }

  const renderTitle = () => {
    const TITLES = props.show ? {
      'device/group': 'Device/Group Alert Settings',
      'function': 'Function Alert Settings',
      'integration': 'Integration Alert Settings'
    } : {
      'device/group': 'New Device/Group Alert',
      'function': 'New Function Alert',
      'integration': 'New Integration Alert'
    };

    return TITLES[alertType];
  }

  return (
    <React.Fragment>
      <div style={{ padding: '30px 30px 20px 30px' }}>
        <Button icon={<ArrowLeftOutlined />} style={{ border: 'none' }} onClick={props.back}>Back</Button>
        {props.show && (
          <div style={{ float: 'right', padding: '0px 100px' }}>
            <Button size="middle" type="danger" style={{ borderRadius: 5 }} onClick={openDeleteAlertModal}>Delete</Button>
          </div>
        )}
        <Row style={{ marginTop: '10px' }}>
          <Col span={10} style={{ padding: '70px 80px' }}>
            <img src={renderIcon()} />
            <h1 style={{ marginTop: 10, fontSize: '23px', fontWeight: 600 }}>{renderTitle()}</h1>
            <div>
              <p style={{ fontSize: '16px' }}>Alerts can be created for Device/Group Nodes, Function Nodes or Integration Nodes.</p>
              <p><a>Learn more about alerts</a></p>
            </div>
          </Col>
          <Col span={12} style={{ padding: '40px 20px'}}>
            <AlertSettings
              alertType={alertType}
              save={(name, emailConfig, webhookConfig) => {
                if (props.show) {
                  dispatch(updateAlert(props.id, {
                    ...name && { name },
                    config: {
                      ...(emailConfig && { email: emailConfig }),
                      ...(webhookConfig && { webhook: webhookConfig })
                    }
                  }));
                } else {
                  dispatch(createAlert({
                    name: name,
                    config: {
                      ...(emailConfig && { email: emailConfig }),
                      ...(webhookConfig && { webhook: webhookConfig })
                    },
                    node_type: props.alertType
                  })).then(_ => {
                    props.backToAll();
                  });
                }
              }}
              saveText={props.show ? 'Update' : 'Create'}
              saveIcon={props.show ? <EditOutlined /> : <PlusOutlined />}
              data={data}
              show={props.show}
            />
          </Col>
        </Row>
      </div>
      <DeleteAlertModal
        open={showDeleteAlertModal}
        alert={{ id: props.id, ...(data && { ...data.alert })}}
        close={closeDeleteAlertModal}
        cancel={() => { setShowDeleteAlertModal(false) }}
      />
    </React.Fragment>
  );
}