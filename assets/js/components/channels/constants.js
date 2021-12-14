import React from "react";
import AzureForm from "./forms/AzureForm.jsx";
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
    default:
      return (
        <AzureForm
          onValidInput={onValidInput}
          type="update"
          channel={channel}
          mobile={mobile}
        />
      );
  }
};
