import React from "react";
import AzureHubForm from "./default/AzureHubForm.jsx";
import AzureCentralForm from "./default/AzureCentralForm.jsx";
import AWSForm from "./default/AWSForm.jsx";
import GoogleForm from "./default/GoogleForm.jsx";
import MQTTForm from "./default/MQTTForm.jsx";
import HTTPForm from "./default/HTTPForm.jsx";

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
