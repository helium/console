import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Table, Button } from "antd";
import Text from "antd/lib/typography/Text";
import DeviceLabelTriggerIcon from "../../../img/alerts/alert-trigger-device-label.svg";
import IntegrationTriggerIcon from "../../../img/alerts/alert-trigger-integration.svg";
import moment from "moment";
import { DeleteOutlined } from "@ant-design/icons";
import UserCan from "../common/UserCan";
import findKey from "lodash/findKey";

export default (props) => {
  const renderTrigger = (trigger) => {
    switch (trigger) {
      case "device/label":
        return (
          <span>
            <img
              src={DeviceLabelTriggerIcon}
              style={{ height: 20, marginRight: 5 }}
            />
            Device/Label
          </span>
        );
      case "integration":
        return (
          <span>
            <img
              src={IntegrationTriggerIcon}
              style={{ height: 20, marginRight: 5 }}
            />
            Integration
          </span>
        );
      default:
        return null;
    }
  };

  const renderType = (config) => {
    const parsedConfig = JSON.parse(config);

    const hasEmail =
      findKey(parsedConfig, function (e) {
        return e.email;
      }) !== undefined;

    const hasWebhook =
      findKey(parsedConfig, function (e) {
        return e.webhook;
      }) !== undefined;

    if (hasEmail && hasWebhook) return "Email, Webhook";
    if (hasEmail) return "Email";
    if (hasWebhook) return "Webhook";
  };

  const columns = [
    {
      title: "Alert Name",
      dataIndex: "name",
      render: (data, record) => <Link to={`/alerts/${record.id}`}>{data}</Link>,
    },
    {
      title: "Trigger",
      dataIndex: "node_type",
      render: (data) => renderTrigger(data),
    },
    {
      title: "Alert Type",
      dataIndex: "config",
      render: (data) => renderType(data),
    },
    {
      title: "Last Time Alerted",
      dataIndex: "last_triggered_at",
      render: (data) =>
        data ? (
          moment.utc(data).local().format("lll")
        ) : (
          <span style={{ color: "grey" }}>Not yet alerted</span>
        ),
    },
    {
      title: "",
      dataIndex: "",
      render: (text, record) => (
        <UserCan>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              shape="circle"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                props.openDeleteAlertModal(record);
              }}
            />
          </div>
        </UserCan>
      ),
    },
  ];

  return (
    <Fragment>
      <div style={{ padding: "30px 20px 20px 30px" }}>
        <Text style={{ fontSize: 22, fontWeight: 600 }}>All Alerts</Text>
      </div>
      <Table
        dataSource={props.data}
        columns={columns}
        rowKey={(record) => record.id}
      />
    </Fragment>
  );
};
