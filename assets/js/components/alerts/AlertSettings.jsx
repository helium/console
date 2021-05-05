import React, { Fragment, useState, useEffect } from "react";
import { Button, Input } from "antd";
import Text from "antd/lib/typography/Text";
import { Tabs } from "antd";
const { TabPane } = Tabs;
import { DEFAULT_SETTINGS, ALERT_TYPES } from "./constants";
import AlertSetting from "./AlertSetting";

export default ({
  alertType,
  save,
  saveText,
  cancel,
  back,
  saveIcon,
  show,
  data,
}) => {
  const [name, setName] = useState("");
  const [config, setConfig] = useState({});
  const [alertData, setAlertData] = useState({});

  useEffect(() => {
    if (show && data) {
      const parsedConfig = JSON.parse(data.alert.config);
      setAlertData({
        node_type: data.alert.node_type,
        config: parsedConfig,
        name: data.alert.name,
      });
      setConfig(parsedConfig);
    }
  }, [data]);

  const renderForm = () => {
    return (
      <Tabs defaultActiveKey="email" size="large" centered>
        <TabPane tab="Email" key="email">
          {alertType &&
            DEFAULT_SETTINGS[alertType].map((s) => (
              <AlertSetting
                key={`setting-email-${s.key}`}
                eventKey={s.key}
                eventDescription={s.description}
                hasValue={s.hasValue}
                type="email"
                value={
                  show &&
                  alertData &&
                  alertData.config &&
                  alertData.config[s.key] &&
                  alertData.config[s.key].email
                }
                onChange={(settings) => {
                  if (settings.checked) {
                    setConfig({
                      ...config,
                      [settings.key]: {
                        ...(config[settings.key] &&
                          "webhook" in config[settings.key] && {
                            webhook: config[settings.key].webhook,
                          }),
                        email: {
                          recipient: settings.recipient,
                          ...("value" in settings && {
                            value: parseInt(settings.value),
                          }),
                        },
                      },
                    });
                  } else {
                    if (settings.key in config) {
                      setConfig({
                        ...config,
                        [settings.key]: {
                          ...(config[settings.key] &&
                            "webhook" in config[settings.key] && {
                              webhook: config[settings.key].webhook,
                            }),
                          email: undefined,
                        },
                      });
                    }
                  }
                }}
              />
            ))}
        </TabPane>
        <TabPane tab="Webhooks" key="webhooks">
          {alertType &&
            DEFAULT_SETTINGS[alertType].map((s) => (
              <AlertSetting
                key={`setting-webhook-${s.key}`}
                eventKey={s.key}
                eventDescription={s.description}
                hasValue={s.hasValue}
                type="webhook"
                value={
                  show &&
                  alertData &&
                  alertData.config &&
                  alertData.config[s.key] &&
                  alertData.config[s.key].webhook
                }
                onChange={(settings) => {
                  if (settings.checked) {
                    setConfig({
                      ...config,
                      [settings.key]: {
                        ...(config[settings.key] &&
                          "email" in config[settings.key] && {
                            email: config[settings.key].email,
                          }),
                        webhook: {
                          url: settings.url,
                          notes: settings.notes,
                          ...("value" in settings && {
                            value: parseInt(settings.value),
                          }),
                        },
                      },
                    });
                  } else {
                    if (settings.key in config) {
                      setConfig({
                        ...config,
                        [settings.key]: {
                          ...(config[settings.key] &&
                            "email" in config[settings.key] && {
                              email: config[settings.key].email,
                            }),
                          webhook: undefined,
                        },
                      });
                    }
                  }
                }}
              />
            ))}
        </TabPane>
      </Tabs>
    );
  };

  const renderButton = () => {
    return (
      <Button
        icon={saveIcon}
        type="primary"
        style={{
          borderColor: alertType && ALERT_TYPES[alertType].color,
          backgroundColor: alertType && ALERT_TYPES[alertType].color,
          borderRadius: 50,
          text: "white",
        }}
        onClick={() => {
          save(name, config);
        }}
      >
        {`${saveText} ${alertType && ALERT_TYPES[alertType].name} Alert`}
      </Button>
    );
  };

  return (
    <Fragment>
      <Text style={{ fontSize: "16px" }} strong>
        Alert Name
      </Text>
      <Input
        onChange={(e) => {
          setName(e.target.value);
        }}
        value={name}
        placeholder={show ? alertData.name : "e.g. Master Alert"}
        suffix={`${name.length}/25`}
        maxLength={25}
      />
      <div style={{ marginTop: 20 }}>{renderForm()}</div>
      <div style={{ marginTop: 20 }}>
        {renderButton()}
        {cancel && (
          <Button
            style={{ marginLeft: 10, borderRadius: 50 }}
            onClick={() => {
              back();
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </Fragment>
  );
};
