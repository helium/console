import React, { Component } from "react";
import Editor from "react-simple-code-editor";
import range from "lodash/range";
import kebabCase from "lodash/kebabCase";
import { highlight, languages } from "prismjs/components/prism-core";
import { IntegrationTypeTileSimple } from "../IntegrationTypeTileSimple";
import { getRootType } from "../../../util/integrationInfo";
import { codeEditorLineColor, codeEditorBgColor } from "../../../util/colors";
import { Link } from "react-router-dom";
import ChannelNameForm from "./ChannelNameForm.jsx";
import GoogleSheetRequestFields from "./GoogleSheetRequestFields.jsx";
import analyticsLogger from "../../../util/analyticsLogger";
import { Card, Typography, Input, Button } from 'antd';
const { Text } = Typography

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

class GoogleSheetForm extends Component {
  state = {
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    showNextSteps: false,
    validInput: false,
    channelName: "",
    formId: "",
    googleFunctionBody: ""
  };

  handleNameInput = (e) => {
    this.setState({ channelName: e.target.value });
  };

  onClickEditor = () => {
    const editor = document.getElementsByClassName(
      "npm__react-simple-code-editor__textarea"
    )[0];
    editor.focus();
  };

  handleGoogleFunctionBodyUpdate = (googleFunctionBody) => {
    this.setState({ googleFunctionBody });
  };

  validateInput = (formId, fieldsMapping) => {
    this.setState({
      showNextSteps: true,
      validInput: true,
      formId,
      googleFunctionBody: makeTemplate(JSON.parse(fieldsMapping))
    })
  }

  clearInputs = () => {
    this.setState({
      showNextSteps: false,
      validInput: false,
      channelName: "",
      formId: "",
      googleFunctionBody: ""
    })
  }

  onSubmit = () => {
    const { method, formId, headers, channelName, googleFunctionBody } = this.state

    let payload = {
      channel: {
        name: channelName,
        type: getRootType(this.props.type),
        credentials: {
          method: method,
          endpoint: `https://docs.google.com/forms/d/e/${formId}/formResponse`,
          headers: headers
        },
        payload_template: "{{{decoded.payload}}}",
      },
    };

    this.props.createChannel(payload, {
      format: "googlesheet",
      body: googleFunctionBody,
    });

    analyticsLogger.logEvent(
      this.props.mobile ? "ACTION_CREATE_CHANNEL_MOBILE" : "ACTION_CREATE_CHANNEL",
      {
        name: channelName,
        type: this.props.type,
      }
    )
  }

  render() {
    return (
      <>
        <Card title="Step 1 – Choose an Integration Type">
          <div>
            <IntegrationTypeTileSimple type={this.props.type} />
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                this.props.reset()
              }}
            >
              <Button style={{ marginTop: 15 }}>Change</Button>
            </Link>
          </div>
        </Card>

        <Card title="Step 2 - Endpoint Details">
          <GoogleSheetRequestFields from="ChannelNew" validateInput={this.validateInput} clearInputs={this.clearInputs} />
        </Card>

        {this.state.showNextSteps && (
          <ChannelNameForm
            channelName={this.state.channelName}
            onInputUpdate={this.handleNameInput}
            validInput={this.state.validInput}
            submit={this.onSubmit}
            mobile={this.props.mobile}
            noSubmit={true}
          />
        )}

        {this.state.showNextSteps && (
          <Card
            title={"Step 4 - Update Function Body"}
            bodyStyle={{ padding: 0 }}
            extra={
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.onSubmit}
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
      </>
    );
  }
}

export default GoogleSheetForm;
