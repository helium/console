import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import FunctionDashboardLayout from "./FunctionDashboardLayout";
import UserCan from "../common/UserCan";
import FunctionValidator from "./FunctionValidator";
import { createFunction } from "../../actions/function";
import { functionTypes, functionFormats } from "../../util/functionInfo";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from "../../util/constants";
import { Button, Input, Select, Card } from "antd";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
const { Option } = Select;

export const customFunctionBody = `function Decoder(bytes, port, uplink_info) {
/*
  The uplink_info variable is an OPTIONAL third parameter that provides the following:

  uplink_info = {
    type: "join",
    uuid: <UUIDv4>,
    id: <device id>,
    name: <device name>,
    dev_eui: <dev_eui>,
    app_eui: <app_eui>,
    metadata: {...},
    fcnt: <integer>,
    reported_at: <timestamp>,
    port: <integer>,
    devaddr: <devaddr>,
    hotspots: {...},
    hold_time: <integer>
  }
*/

  if (uplink_info) {
    // do something with uplink_info fields
  }

  return decoded;
}
`;

@connect(null, mapDispatchToProps)
class FunctionNew extends Component {
  state = {
    name: "",
    type: null,
    format: null,
    body: customFunctionBody,
  };

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_FUNCTIONS_NEW");
  }

  handleInputUpdate = (e) => this.setState({ [e.target.name]: e.target.value });

  handleSelectFunctionType = () => this.setState({ type: "decoder" });

  handleSelectFormat = (format) => this.setState({ format });

  handleFunctionUpdate = (body) => this.setState({ body });

  handleSubmit = () => {
    const { name, type, format, body } = this.state;
    const fxn = { name, type, format, body };
    this.props.createFunction(fxn);

    analyticsLogger.logEvent("ACTION_CREATE_FUNCTION", {
      name: name,
      type: type,
      format: format,
    });
  };

  render() {
    const { name, type, format, body } = this.state;
    return (
      <>
        <MobileDisplay />
        <DesktopDisplay>
          <FunctionDashboardLayout {...this.props}>
            <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
              <div style={{ padding: "30px 30px 20px 30px", minWidth }}>
                <Card title="Step 1 - Enter Function Details">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Input
                      placeholder="e.g. My Decoder"
                      name="name"
                      value={name}
                      onChange={this.handleInputUpdate}
                      style={{ width: 300 }}
                      suffix={`${name.length}/50`}
                      maxLength={50}
                    />
                    <Select
                      placeholder="Function Type"
                      onSelect={this.handleSelectFunctionType}
                      style={{ width: 220, marginLeft: 8 }}
                    >
                      {Object.keys(functionTypes).map(key => {
                        return <Option key={key} value={key}>{functionTypes[key]}</Option>
                      })}
                    </Select>
                    <Select
                      placeholder="Choose Format"
                      onSelect={this.handleSelectFormat}
                      style={{ width: 220, marginLeft: 8 }}
                      disabled={!type}
                    >
                      {Object.keys(functionFormats).map(key => {
                        return <Option key={key} value={key}>{functionFormats[key]}</Option>
                      })}
                    </Select>
                  </div>
                  {format === "custom" && (
                    <a
                      href="https://github.com/helium/console-decoders"
                      target="_blank"
                    >
                      View list of supported functions created by the Helium
                      community
                    </a>
                  )}
                </Card>
                {type && format === "custom" && (
                  <FunctionValidator
                    handleFunctionUpdate={this.handleFunctionUpdate}
                    body={body}
                    title="Step 2 - Enter Custom Script"
                  />
                )}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <UserCan>
                    <Button
                      icon={<SaveOutlined />}
                      onClick={this.handleSubmit}
                      disabled={!type || !format || name.length === 0}
                    >
                      Save Function
                    </Button>
                  </UserCan>
                </div>
              </div>
            </div>
          </FunctionDashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createFunction }, dispatch);
}

export default FunctionNew;
