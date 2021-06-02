import React, { Component } from "react";
import { connect } from "react-redux";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import DashboardLayout from "../common/DashboardLayout";
import { codeEditorLineColor, codeEditorBgColor } from "../../util/colors";
import AzureForm from "./forms/AzureForm.jsx";
import AWSForm from "./forms/AWSForm.jsx";
import GoogleForm from "./forms/GoogleForm.jsx";
import MQTTForm from "./forms/MQTTForm.jsx";
import HTTPForm from "./forms/HTTPForm.jsx";
import CargoForm from "./forms/CargoForm.jsx";
import MyDevicesForm from "./forms/MyDevicesForm.jsx";
import AdafruitForm from "./forms/AdafruitForm.jsx";
import UbidotsForm from "./forms/UbidotsForm.jsx";
import DatacakeForm from "./forms/DatacakeForm.jsx";
import TagoForm from "./forms/TagoForm.jsx";
import GoogleSheetForm from "./forms/GoogleSheetForm.jsx";
import MicroshareForm from "./forms/MicroshareForm.jsx";
import ChannelNameForm from "./forms/ChannelNameForm.jsx";
import ChannelCreateRow from "./ChannelCreateRow";
import ChannelPremadeRow from "./ChannelPremadeRow";
import ChannelPayloadTemplate from "./ChannelPayloadTemplate";
import LabelsAppliedNew from "../common/LabelsAppliedNew";
import { createChannel } from "../../actions/channel";
import analyticsLogger from "../../util/analyticsLogger";
import kebabCase from "lodash/kebabCase";
import range from "lodash/range";
import { Typography, Select, Card, Button } from "antd";
import { IntegrationTypeTileSimple } from "./IntegrationTypeTileSimple";
import DecoderForm from "./DecoderForm";
import {
  NEW_CHANNEL_TYPES,
  PREMADE_CHANNEL_TYPES,
} from "../../util/integrationInfo";
const { Text } = Typography;
const { Option } = Select;
import _JSXStyle from "styled-jsx/style";
import { adafruitTemplate } from "../../util/integrationTemplates";

const slugify = (text) => kebabCase(text.replace(/&/g, "-and-"));
const makeTemplate = (definition) => {
  const fields = [];
  const payloads = [];

  Object.entries(definition).forEach(([fieldName, entry]) => {
    const name = slugify(fieldName);
    fields.push(`"${name}": "${entry}"`);
    payloads.push(`"${name}": "FILL ME IN"`);
  });

  return `function Decoder(bytes, port) {
  // TODO: Transform bytes to decoded payload below
  var decodedPayload = {
    ${payloads.join(",\n".padEnd(6))}
  };
  // END TODO

  return Serialize(decodedPayload)
}

// Generated: do not touch unless your Google Form fields have changed
var field_mapping = {
  ${fields.join(",\n".padEnd(4))}
};
// End Generated

function Serialize(payload) {
  var str = [];
  for (var key in payload) {
    if (payload.hasOwnProperty(key)) {
      var name = encodeURIComponent(field_mapping[key]);
      var value = encodeURIComponent(payload[key]);
      str.push(name + "=" + value);
    }
  }
  return str.join("&");
}
// DO NOT REMOVE: Google Form Function
  `;
};

@connect(null, mapDispatchToProps)
class ChannelNew extends Component {
  state = {
    type: this.props.match.params.id,
    showNextSteps: false,
    credentials: {},
    channelName: "",
    labels: {},
    templateBody:
      this.props.match.params.id === "adafruit" ? adafruitTemplate : "",
    func: {
      format: "cayenne",
    },
    googleFieldsMapping: null,
    googleFunctionBody: "",
  };

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_NEW");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id)
      this.setState({
        type: this.props.match.params.id,
        showNextSteps: false,
        credentials: {},
        channelName: "",
        labels: [],
        templateBody: "",
        validInput: true,
      });
  }

  handleStep2Input = (credentials, validInput = true) => {
    this.setState({ credentials, showNextSteps: true, validInput });
  };

  handleStep3Input = (e) => {
    this.setState({ channelName: e.target.value });
  };

  handleDecoderSelection = (payload) => {
    let func;
    if (payload.format === "custom") {
      func = {
        format: "custom",
        id: payload.func ? payload.func.id : null,
      };
    } else {
      func = {
        name: this.state.channelName,
        format: "cayenne",
      };
    }
    this.setState({
      func,
      templateBody: payload.format === "cayenne" ? adafruitTemplate : "",
    });
  };

  getRootType = (type) => {
    switch (type) {
      case "cargo":
      case "mydevices":
      case "ubidots":
      case "datacake":
      case "tago":
      case "googlesheet":
      case "microshare":
        return "http";
      case "adafruit":
        return "mqtt";
      default:
        return type;
    }
  };

  handleStep3Submit = (e) => {
    e.preventDefault();
    const {
      channelName,
      type,
      credentials,
      labels,
      templateBody,
      func,
      googleFieldsMapping,
      googleFunctionBody,
    } = this.state;
    analyticsLogger.logEvent("ACTION_CREATE_CHANNEL", {
      name: channelName,
      type: type,
    });
    let payload = {
      channel: {
        name: channelName,
        type: this.getRootType(type),
        credentials,
        payload_template:
          type === "http" || type === "mqtt" || type === "adafruit"
            ? templateBody
            : undefined,
      },
    };
    if (type === "adafruit") {
      payload.func = func;
    } else if (type === "googlesheet") {
      payload.googleFunc = googleFunctionBody;
      payload.channel.payload_template = "{{{decoded.payload}}}";
    } else {
      payload.labels = labels;
    }
    this.props.createChannel(payload);
  };

  handleLabelsUpdate = (labels) => {
    this.setState({ labels });
  };

  handleTemplateUpdate = (templateBody) => {
    this.setState({ templateBody });
  };

  handleGoogleFieldsMappingUpdate = (googleFieldsMapping) => {
    this.setState({
      googleFieldsMapping,
      googleFunctionBody: makeTemplate(JSON.parse(googleFieldsMapping)),
    });
  };

  handleGoogleFunctionBodyUpdate = (googleFunctionBody) => {
    this.setState({ googleFunctionBody });
  };

  onClickEditor = () => {
    const editor = document.getElementsByClassName(
      "npm__react-simple-code-editor__textarea"
    )[0];
    editor.focus();
  };

  renderForm = () => {
    switch (this.state.type) {
      case "aws":
        return <AWSForm onValidInput={this.handleStep2Input} />;
      case "google":
        return <GoogleForm onValidInput={this.handleStep2Input} />;
      case "mqtt":
        return <MQTTForm onValidInput={this.handleStep2Input} />;
      case "http":
        return <HTTPForm onValidInput={this.handleStep2Input} />;
      case "azure":
        return <AzureForm onValidInput={this.handleStep2Input} />;
      case "mydevices":
        return <MyDevicesForm onValidInput={this.handleStep2Input} />;
      case "adafruit":
        return <AdafruitForm onValidInput={this.handleStep2Input} />;
      case "ubidots":
        return <UbidotsForm onValidInput={this.handleStep2Input} />;
      case "datacake":
        return <DatacakeForm onValidInput={this.handleStep2Input} />;
      case "tago":
        return <TagoForm onValidInput={this.handleStep2Input} />;
      case "googlesheet":
        return (
          <GoogleSheetForm
            onValidInput={this.handleStep2Input}
            updateGoogleFieldsMapping={this.handleGoogleFieldsMappingUpdate}
            from="ChannelNew"
          />
        );
      case "microshare":
        return <MicroshareForm onValidInput={this.handleStep2Input} />;
      default:
        return <CargoForm onValidInput={this.handleStep2Input} />;
    }
  };

  getIntegrationType = () => {
    return [...PREMADE_CHANNEL_TYPES, ...NEW_CHANNEL_TYPES].filter(
      (t) => t.link.split("new/")[1] === this.state.type
    );
  };

  render() {
    const { showNextSteps, type, labels } = this.state;

    return (
      <DashboardLayout
        title="Add Integration"
        user={this.props.user}
        breadCrumbs={
          <div style={{ marginLeft: 4, paddingBottom: 0 }}>
            <Link to="/integrations">
              <Text style={{ color: "#8C8C8C" }}>
                Integrations&nbsp;&nbsp;/
              </Text>
            </Link>
            {type ? (
              <Link to="/integrations/new">
                <Text style={{ color: `${type ? "#8C8C8C" : ""}` }}>
                  &nbsp;&nbsp;Add Integration&nbsp;&nbsp;/
                </Text>
              </Link>
            ) : (
              <Text>&nbsp;&nbsp;Add Integration</Text>
            )}
            <Text>
              &nbsp;&nbsp;{type ? this.getIntegrationType()[0].name : null}
            </Text>
          </div>
        }
      >
        <Card title="Step 1 – Choose an Integration Type">
          {type && (
            <div
              className="flexwrapper"
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <IntegrationTypeTileSimple type={type} />
              <Link to="/integrations/new">
                <Button size="small">Change</Button>
              </Link>
            </div>
          )}
          {!type && (
            <div style={{ display: "block" }}>
              <Card
                size="small"
                title="Add a Prebuilt Integration"
                className="integrationcard"
              >
                <ChannelPremadeRow />
              </Card>
              <Card
                size="small"
                title="Add a Custom Integration"
                className="integrationcard"
              >
                <ChannelCreateRow />
              </Card>
            </div>
          )}
        </Card>
        {type && (
          <Card title="Step 2 - Endpoint Details">{this.renderForm()}</Card>
        )}
        {showNextSteps && (
          <ChannelNameForm
            channelName={this.state.channelName}
            onInputUpdate={this.handleStep3Input}
          />
        )}
        {showNextSteps && type === "adafruit" && (
          <DecoderForm onChange={this.handleDecoderSelection}>
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleStep3Submit}
                disabled={!this.state.validInput}
              >
                Add Integration
              </Button>
            </div>
          </DecoderForm>
        )}
        {showNextSteps && type === "googlesheet" && (
          <Card
            title={"Step 4 - Update Function Body"}
            bodyStyle={{ padding: 0 }}
            extra={
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleStep3Submit}
                disabled={!this.state.validInput}
              >
                Add Integration
              </Button>
            }
          >
            <div style={{ height: 303, overflowY: "scroll" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  cursor: "text",
                }}
                onClick={this.onClickEditor}
              >
                <div
                  style={{
                    backgroundColor: codeEditorBgColor,
                    paddingTop: 9,
                    marginTop: 1,
                    paddingBottom: 9,
                  }}
                >
                  {range(301).map((i) => (
                    <p
                      key={i}
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: codeEditorLineColor,
                        fontSize: 14,
                        marginBottom: 0,
                        paddingLeft: 10,
                        paddingRight: 10,
                        backgroundColor: codeEditorBgColor,
                      }}
                    >
                      {i}
                    </p>
                  ))}
                </div>

                <Editor
                  value={this.state.googleFunctionBody}
                  onValueChange={this.handleGoogleFunctionBodyUpdate}
                  highlight={(code) => highlight(code, languages.js)}
                  padding={10}
                  style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </Card>
        )}
        {showNextSteps && type !== "adafruit" && type !== "googlesheet" && (
          <Card
            title={"Step 4 - Apply Integration to Label (Can be added later)"}
          >
            <Text style={{ display: "block", marginBottom: 30 }}>
              Labels are necessary to connect devices to integrations
            </Text>
            <LabelsAppliedNew handleLabelsUpdate={this.handleLabelsUpdate} />
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleStep3Submit}
                disabled={!this.state.validInput}
              >
                Add Integration
              </Button>
            </div>
          </Card>
        )}
        {showNextSteps && (type === "http" || type === "mqtt") && (
          <ChannelPayloadTemplate
            templateBody={this.state.templateBody}
            handleTemplateUpdate={this.handleTemplateUpdate}
            functions={
              labels.labelsApplied
                ? labels.labelsApplied.map((l) => l.function)
                : []
            }
            from="channelNew"
          />
        )}
        <style jsx>{`
          .flexwrapper {
            display: flex;
            flex-wrap: wrap;
          }

          .integrationcard {
            flex-grow: 1;
          }
        `}</style>
      </DashboardLayout>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

export default ChannelNew;
