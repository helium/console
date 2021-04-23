import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Row, Col, Input } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import AddDeviceAlertIcon from '../../../img/alerts/device-group-alert-add-icon.svg';
import AddFunctionAlertIcon from '../../../img/alerts/function-alert-add-icon.svg';
import AddIntegrationAlertIcon from '../../../img/alerts/channel-alert-add-icon.svg';
import Text from 'antd/lib/typography/Text';
import { useDispatch } from "react-redux";
import { createAlert, updateAlert } from '../../actions/alert';
import { Tabs } from 'antd';
const { TabPane } = Tabs;
import { DEFAULT_SETTINGS } from './constants';
import AlertSetting from './AlertSetting';
import { ALERT_SHOW } from '../../graphql/alerts';
import { useQuery } from '@apollo/client';
import { SkeletonLayout } from '../common/SkeletonLayout';
import DeleteAlertModal from './DeleteAlertModal';

export default (props) => {
  const [name, setName] = useState('');
  const [emailConfig, setEmailConfig] = useState({});
  const [webhookConfig, setWebhookConfig] = useState({});
  const [showDeleteAlertModal, setShowDeleteAlertModal] = useState(false);
  const [_tab, setTab] = useState('email');
  const dispatch = useDispatch();
  const [alertData, setAlertData] = useState({});
  const { loading, error, data, refetch } = useQuery(ALERT_SHOW, {
    variables: { id: props.id },
    skip: !props.id
  });
  const socket = useSelector(state => state.apollo.socket);

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
  
  useEffect(() => {
    if (!loading && !error && data) {
      const parsedConfig = JSON.parse(data.alert.config);
      setAlertData({
        node_type: data.alert.node_type,
        config: parsedConfig,
        name: data.alert.name
      });
      if (parsedConfig.email) setEmailConfig(parsedConfig.email);
      if (parsedConfig.webhook) setWebhookConfig(parsedConfig.webhook);
    }
  }, [data]);

  if (loading) return <SkeletonLayout />;
  if (error) return <Text>Data failed to load, please reload the page and try again</Text>;

  const renderIcon = () => {
    const alertType = props.show ? alertData.node_type : props.alertType;
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
    const alertType = props.show ? alertData.node_type : props.alertType;
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

  const renderForm = () => {
    const alertType = props.show ? alertData.node_type : props.alertType;
    return (
      <Tabs defaultActiveKey="email" size="large" centered onTabClick={tab => setTab(tab)}>
        <TabPane tab="Email" key="email">
          {alertType && DEFAULT_SETTINGS[alertType].map(s => (
            <AlertSetting
              key={`setting-email-${s.key}`}
              eventKey={s.key}
              eventDescription={s.description}
              hasValue={s.hasValue}
              type='email'
              value={props.show && alertData.config.email[s.key]}
              onChange={settings => {
                if (settings.checked) {
                  setEmailConfig({
                    ...emailConfig,
                    [settings.key]: {
                      recipient: settings.recipient,
                      ...('value' in settings && { value: settings.value })
                    }
                  });
                } else {
                  if (settings.key in emailConfig) {
                    setEmailConfig({
                      ...emailConfig,
                      [settings.key]: undefined
                    });
                  }
                }
              }}
            />
          ))}
        </TabPane>
        <TabPane tab="Webhooks" key="webhooks">
          {alertType && DEFAULT_SETTINGS[alertType].map(s => (
            <AlertSetting
              key={`setting-webhook-${s.key}`}
              eventKey={s.key}
              eventDescription={s.description}
              hasValue={s.hasValue}
              type='webhook'
              onChange={settings => {
                if (settings.checked) {
                  setWebhookConfig({
                    ...webhookConfig,
                    [settings.key]: {
                      url: settings.url,
                      notes: settings.notes,
                      ...('value' in settings && { value: settings.value })
                    }
                  });
                } else {
                  if (settings.key in webhookConfig) {
                    setWebhookConfig({
                      ...webhookConfig,
                      [settings.key]: undefined
                    });
                  }
                }
              }}
            />
          ))}
        </TabPane>
      </Tabs>
    );
  }

  const renderButton = () => {
    const ALERT_TYPES = {
      'device/group': {
        name: 'Device/Group',
        color: '#2C79EE'
      },
      'function': {
        name: 'Function',
        color: '#9F59F7'
      },
      'integration': {
        name: 'Integration',
        color: '#12CB9E'
      }
    }

    const alertType = props.show ? alertData.node_type : props.alertType;

    return (
      <Button
        icon={props.show ? <EditOutlined /> : <PlusOutlined />}
        type="primary"
        style={{ backgroundColor: alertType && ALERT_TYPES[alertType].color, borderRadius: 50, text: 'white' }}
        onClick={() => {
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
      >
        {`${props.show ? 'Update' : 'Create'} ${alertType && ALERT_TYPES[alertType].name} Alert`}
      </Button>
    );
  }

  return (
    <React.Fragment>
      <div style={{ padding: '30px 30px 20px 30px' }}>
        <Button icon={<ArrowLeftOutlined />} style={{ border: 'none' }} onClick={props.back}>Back</Button>
        <div style={{ float: 'right', padding: '0px 100px' }}>
          <Button size="middle" type="danger" style={{ borderRadius: 5 }} onClick={openDeleteAlertModal}>Delete</Button>
          </div>
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
            <Text style={{ fontSize: '16px' }} strong>Alert Name</Text>
            <Input
              onChange={e => { setName(e.target.value) }}
              value={name}
              placeholder={props.show ? alertData.name : 'e.g. Master Alert'}
              suffix={`${name.length}/25`} 
              maxLength={25}
            />
            <div style={{ marginTop: 20 }}>
              {renderForm()}
            </div>
            <div style={{ marginTop: 20 }}>
              {renderButton()}
            </div>
          </Col>
        </Row>
      </div>
      <DeleteAlertModal
        open={showDeleteAlertModal}
        alert={{ ...alertData, id: props.id}}
        close={closeDeleteAlertModal}
      />
    </React.Fragment>
  );
}