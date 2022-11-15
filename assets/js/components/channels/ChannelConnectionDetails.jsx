import React from "react";
import UserCan from "../common/UserCan";
import { Collapse, Card, Divider, Button } from "antd";
import { minWidth } from "../../util/constants";
import AzureHubForm from "./default/AzureHubForm.jsx";
import AzureCentralForm from "./default/AzureCentralForm.jsx";
import AWSForm from "./default/AWSForm.jsx";
import GoogleForm from "./default/GoogleForm.jsx";
import MQTTForm from "./default/MQTTForm.jsx";
import HTTPForm from "./default/HTTPForm.jsx";
import AdafruitForm from "./community/adafruit/AdafruitUpdateForm.jsx";
import AkenzaForm from "./community/akenza/AkenzaUpdateForm.jsx";
import DatacakeForm from "./community/datacake/DatacakeUpdateForm.jsx";
import GoogleSheetForm from "./community/google_sheets/GoogleSheetUpdateForm.jsx";
import MicroshareForm from "./community/microshare/MicroshareUpdateForm.jsx";
import TagoForm from "./community/tago/TagoUpdateForm.jsx";
import UbidotsForm from "./community/ubidots/UbidotsUpdateForm.jsx";
import QubitroForm from "./community/qubitro/QubitroForm";
const { Panel } = Collapse

function DetailsUpdateWrapper({ handleUpdateDetailsChange, validInput, children, mobile }) {
  if (mobile) return (
    <Collapse expandIconPosition="right" style={{ margin: "25px 0" }}>
      <Panel header={<b>UPDATE YOUR CONNECTION DETAILS</b>} key="1">
        {children}
        <Button
          type="primary"
          style={{ marginTop: 10 }}
          onClick={handleUpdateDetailsChange}
          disabled={!validInput}
        >
          Update Details
        </Button>
      </Panel>
    </Collapse>
  )
  return (
    <UserCan>
      <Card
        title="Update your Connection Details"
        bodyStyle={{ padding: 0 }}
      >
        <div
          className="no-scroll-bar"
          style={{ overflowX: "scroll" }}
        >
          <div style={{ padding: 24, minWidth }}>
            {children}
            <Divider />
            <Button
              type="primary"
              onClick={handleUpdateDetailsChange}
              disabled={!validInput}
            >
              Update Details
            </Button>
          </div>
        </div>
      </Card>
    </UserCan>
  )
}

export default ({ channel, handleUpdateDetailsInput, handleUpdateDetailsChange, validInput, mobile }) => {
  switch (channel.type) {
    case "aws":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <AWSForm
            onValidInput={handleUpdateDetailsInput}
            type="update"
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      );
    case "google":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <GoogleForm
            onValidInput={handleUpdateDetailsInput}
            type="update"
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      );
    case "mqtt":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <MQTTForm
            onValidInput={handleUpdateDetailsInput}
            type="update"
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      );
    case "azure":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <AzureHubForm
            onValidInput={handleUpdateDetailsInput}
            type="update"
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      );
    case "iot_central":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <AzureCentralForm
            onValidInput={handleUpdateDetailsInput}
            type="update"
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      );
    case "qubitro":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <QubitroForm
            onValidInput={handleUpdateDetailsInput}
            type="update"
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      );
    case "cargo":
      return (
        <div style={{ marginBottom: mobile ? 20 : 0 }} />
      );
    case "my_devices":
      return (
        <div style={{ marginBottom: mobile ? 20 : 0 }} />
      );
    case "adafruit":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <AdafruitForm
            onValidInput={handleUpdateDetailsInput}
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      )
    case "akenza":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <AkenzaForm
            onValidInput={handleUpdateDetailsInput}
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      )
    case "datacake":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <DatacakeForm
            onValidInput={handleUpdateDetailsInput}
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      )
    case "google_sheets":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <GoogleSheetForm
            onValidInput={handleUpdateDetailsInput}
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      )
    case "microshare":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <MicroshareForm
            onValidInput={handleUpdateDetailsInput}
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      )
    case "tago":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <TagoForm
            onValidInput={handleUpdateDetailsInput}
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      )
    case "ubidots":
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <UbidotsForm
            onValidInput={handleUpdateDetailsInput}
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      )
    default:
      return (
        <DetailsUpdateWrapper handleUpdateDetailsChange={handleUpdateDetailsChange} validInput={validInput} mobile={mobile}>
          <HTTPForm
            onValidInput={handleUpdateDetailsInput}
            type="update"
            channel={channel}
            mobile={mobile}
          />
        </DetailsUpdateWrapper>
      );
  }
}
