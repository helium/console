import React from "react";
import AzureHubForm from "./forms/AzureHubForm.jsx";
import AzureCentralForm from "./forms/AzureCentralForm.jsx";
import AWSForm from "./forms/AWSForm.jsx";
import GoogleForm from "./forms/GoogleForm.jsx";
import MQTTForm from "./forms/MQTTForm.jsx";
import HTTPForm from "./forms/HTTPForm.jsx";

export const renderConnectionDetails = (channel, onValidInput, mobile) => {
  switch (channel.type) {
    case "aws":
      return (
        <AWSForm
          onValidInput={onValidInput}
          type="update"
          channel={channel}
          mobile={mobile}
        />
      );
    case "google":
      return (
        <GoogleForm
          onValidInput={onValidInput}
          type="update"
          channel={channel}
          mobile={mobile}
        />
      );
    case "mqtt":
      return (
        <MQTTForm
          onValidInput={onValidInput}
          type="update"
          channel={channel}
          mobile={mobile}
        />
      );
    case "http":
      return (
        <HTTPForm
          onValidInput={onValidInput}
          type="update"
          channel={channel}
          mobile={mobile}
        />
      );
    case "iot_central":
      return (
        <AzureCentralForm
          onValidInput={onValidInput}
          type="update"
          channel={channel}
          mobile={mobile}
        />
      );
    default:
      return (
        <AzureHubForm
          onValidInput={onValidInput}
          type="update"
          channel={channel}
          mobile={mobile}
        />
      );
  }
};

export const getDownlinkKey = (channel) =>
  channel.downlink_token || `{:downlink_key}`;

export const getDownlinkUrl = (channel, downlinkKey) => {
  let downlinkUrl = `http://localhost:4000/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;

  if (process.env.SELF_HOSTED && window.env_domain !== "localhost:4000") {
    downlinkUrl = `https://${window.env_domain}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
  }
  if (!process.env.SELF_HOSTED) {
    downlinkUrl = `https://${process.env.ENV_DOMAIN}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
  }

  return downlinkUrl;
};
