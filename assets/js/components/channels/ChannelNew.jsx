import React, { Component } from "react";
import { connect } from "react-redux";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import ChannelDashboardLayout from "./ChannelDashboardLayout";
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
import AdafruitFunctionForm from "./AdafruitFunctionForm";
import AkenzaForm from "./forms/AkenzaForm";
import { createChannel } from "../../actions/channel";
import analyticsLogger from "../../util/analyticsLogger";
import kebabCase from "lodash/kebabCase";
import range from "lodash/range";
import { Card, Button } from "antd";
import { IntegrationTypeTileSimple } from "./IntegrationTypeTileSimple";
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
    type: null,
    showNextSteps: false,
    credentials: {},
    channelName: "",
    templateBody: "",
    func: {
      format: "cayenne",
    },
    googleFieldsMapping: null,
    googleFunctionBody: "",
    validInput: false,
  };

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_NEW");
  }

  handleStep2Input = (credentials, validInput = true) => {
    this.setState({ credentials, showNextSteps: true, validInput });
  };

  handleStep3Input = (e) => {
    this.setState({ channelName: e.target.value });
  };

  getRootType = (type) => {
    switch (type) {
      case "cargo":
      case "mydevices":
      case "ubidots":
      case "datacake":
      case "tago":
      case "googlesheet":
      case "akenza":
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
      func,
      templateBody,
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
      },
    };
    if (type === "http" || type === "mqtt" || type === "adafruit") {
      payload.channel.payload_template = templateBody;
    }
    if (type === "googlesheet") {
      payload.channel.payload_template = "{{{decoded.payload}}}";
    }

    if (type === "adafruit") {
      this.props.createChannel(payload, func);
    } else if (type === "googlesheet") {
      this.props.createChannel(payload, {
        format: "googlesheet",
        body: googleFunctionBody,
      });
    } else {
      this.props.createChannel(payload);
    }
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

  handleAdafruitFunctionSelect = (func) => {
    this.setState({
      func,
      templateBody: func.format === "cayenne" ? adafruitTemplate : "",
    });
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
      case "akenza":
        return <AkenzaForm onValidInput={this.handleStep2Input} />;
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

  handleSelectType = (type) => {
    this.setState({ type });

    if (type === "adafruit") {
      this.setState({ templateBody: adafruitTemplate });
    } else {
      this.setState({ templateBody: "" });
    }
  };

  render() {
    const { showNextSteps, type } = this.state;

    return (
      <ChannelDashboardLayout {...this.props}>
        <div style={{ padding: "30px 30px 20px 30px" }}>
          {!type && (
            <div style={{ display: "block" }}>
              <Card
                size="small"
                title="Add a Prebuilt Integration"
                className="integrationcard"
                bodyStyle={{ padding: 1 }}
              >
                <div
                  style={{
                    padding: 10,
                    height: "100%",
                    width: "100%",
                    overflowX: "scroll",
                  }}
                >
                  <ChannelPremadeRow selectType={this.handleSelectType} />
                </div>
              </Card>
              <Card
                size="small"
                title="Add a Custom Integration"
                className="integrationcard"
                bodyStyle={{ padding: 1 }}
              >
                <div
                  style={{
                    padding: 10,
                    height: "100%",
                    width: "100%",
                    overflowX: "scroll",
                  }}
                >
                  <ChannelCreateRow selectType={this.handleSelectType} />
                </div>
              </Card>
            </div>
          )}

          {type && (
            <Card title="Step 1 – Choose an Integration Type">
              <div
                className="flexwrapper"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IntegrationTypeTileSimple type={type} />
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({ type: null, showNextSteps: false });
                  }}
                >
                  <Button size="small">Change</Button>
                </Link>
              </div>
            </Card>
          )}

          {type && (
            <Card title="Step 2 - Endpoint Details">{this.renderForm()}</Card>
          )}
          {showNextSteps && (
            <ChannelNameForm
              channelName={this.state.channelName}
              onInputUpdate={this.handleStep3Input}
              validInput={this.state.validInput}
              submit={this.handleStep3Submit}
              noName={type === "adafruit" || type === "googlesheet"}
            />
          )}
          {showNextSteps && type === "adafruit" && (
            <AdafruitFunctionForm
              handleFunctionUpdate={this.handleAdafruitFunctionSelect}
            >
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
            </AdafruitFunctionForm>
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
          {showNextSteps && (type === "http" || type === "mqtt") && (
            <ChannelPayloadTemplate
              templateBody={this.state.templateBody}
              handleTemplateUpdate={this.handleTemplateUpdate}
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
        </div>
      </ChannelDashboardLayout>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

export default ChannelNew;
