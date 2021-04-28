import React, { Fragment, useState, useEffect } from 'react';
import { Button, Input } from 'antd';
import Text from 'antd/lib/typography/Text';
import { Tabs } from 'antd';
const { TabPane } = Tabs;
import { DEFAULT_SETTINGS, ALERT_TYPES } from './constants';
import AlertSetting from './AlertSetting';

export default ({ alertType, save, saveText, cancel, back, saveIcon, show, data }) => {
  const [name, setName] = useState('');
  const [emailConfig, setEmailConfig] = useState({});
  const [webhookConfig, setWebhookConfig] = useState({});
  const [alertData, setAlertData] = useState({});

  useEffect(() => {
    if (show && data) {
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

  const renderForm = () => {
    return (
      <Tabs defaultActiveKey="email" size="large" centered>
        <TabPane tab="Email" key="email">
          {alertType && DEFAULT_SETTINGS[alertType].map(s => (
            <AlertSetting
              key={`setting-email-${s.key}`}
              eventKey={s.key}
              eventDescription={s.description}
              hasValue={s.hasValue}
              type='email'
              value={show && alertData && alertData.config && alertData.config.email[s.key]}
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
              value={show && alertData && alertData.config && alertData.config.webhook[s.key]}
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
    return (
      <Button
        icon={saveIcon}
        type="primary"
        style={{ borderColor: alertType && ALERT_TYPES[alertType].color, backgroundColor: alertType && ALERT_TYPES[alertType].color, borderRadius: 50, text: 'white' }}
        onClick={() => {
          save(name, emailConfig, webhookConfig);
        }}
      >
        {`${saveText} ${alertType && ALERT_TYPES[alertType].name} Alert`}
      </Button>
    );
  }

  return(
    <Fragment>
      <Text style={{ fontSize: '16px' }} strong>Alert Name</Text>
      <Input
        onChange={e => { setName(e.target.value) }}
        value={name}
        placeholder={show ? alertData.name : 'e.g. Master Alert'}
        suffix={`${name.length}/25`} 
        maxLength={25}
      />
      <div style={{ marginTop: 20 }}>
        {renderForm()}
      </div>
      <div style={{ marginTop: 20 }}>
        {renderButton()}
        {
          cancel && (
            <Button
              style={{ marginLeft: 10, borderRadius: 50}}
              onClick={() => { back() }}
            >
              Cancel
            </Button>
          )
        }
      </div>
    </Fragment>
  );
}