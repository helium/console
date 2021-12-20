import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createLabel } from "../../actions/label";
import { grayForModalCaptions } from "../../util/colors";
import analyticsLogger from "../../util/analyticsLogger";
import DeviceDashboardLayout from "../devices/DeviceDashboardLayout";
import { MobileDisplay, DesktopDisplay } from '../mobile/MediaQuery'
import MobileLayout from "../mobile/MobileLayout";
import UserCan from "../common/UserCan";
import { Card, Button, Typography, Input } from "antd";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
const { Text } = Typography;
import ProfileDropdown from "../common/ProfileDropdown";

class LabelNew extends Component {
  state = {
    labelName: "",
    configProfileId: null,
  };

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { labelName, configProfileId } = this.state;

    analyticsLogger.logEvent("ACTION_CREATE_LABEL", { name: labelName });
    this.props
      .createLabel({ name: labelName, config_profile_id: configProfileId })
      .then((data) => {
        this.props.history.push("/devices");
      });
  };

  renderLabelDetails = () => {
    return (
      <React.Fragment>
        <Input
          placeholder="Enter Label Name"
          name="labelName"
          value={this.state.labelName}
          onChange={this.handleInputUpdate}
          style={{ marginTop: 10 }}
          suffix={`${this.state.labelName.length}/50`}
          maxLength={50}
        />
        <Text
          style={{
            marginBottom: 20,
            marginTop: 10,
            fontSize: 14,
            color: grayForModalCaptions,
          }}
        >
          Label names must be unique
        </Text>
        <Text style={{ marginTop: 15, display: "block" }} strong>
          Profile (Optional)
        </Text>
        <ProfileDropdown
          selectProfile={(id) => {
            this.setState({ configProfileId: id });
          }}
        />
      </React.Fragment>
    )
  }

  render() {
    return (
      <>
        <MobileDisplay>
          <MobileLayout>
            <div
              style={{
                padding: "10px 15px",
                boxShadow: "0px 3px 7px 0px #ccc",
                backgroundColor: "#F5F7F9",
                height: 100,
                position: 'relative',
                zIndex: 10,
              }}
            >
              <Button
                icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
                style={{
                  border: "none",
                  padding: 0,
                  fontSize: 14,
                  color: "#2C79EE",
                  height: 24,
                  boxShadow: "none",
                  background: "none",
                  fontWeight: 600,
                }}
                onClick={() => {
                  this.props.history.push("/devices");
                }}
              >
                Back to Devices
              </Button>
              <div>
                <Text style={{ fontSize: 27, fontWeight: 600 }}>
                  Create New Label
                </Text>
              </div>
            </div>
            <div style={{ padding: "15px", backgroundColor: '#ffffff', height: "calc(100% - 100px)", overflowY: 'scroll' }}>
              {this.renderLabelDetails()}
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <UserCan>
                  <Button
                    key="submit"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={this.handleSubmit}
                    style={{ marginTop: 15, borderRadius: 4 }}
                  >
                    Save Label
                  </Button>
                </UserCan>
              </div>
            </div>
          </MobileLayout>
        </MobileDisplay>
        <DesktopDisplay>
          <DeviceDashboardLayout {...this.props}>
            <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
              <div style={{ padding: "30px 30px 20px 30px", minWidth: 700 }}>
                <Card title="Enter Label Details">
                  {this.renderLabelDetails()}
                </Card>
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
                      key="submit"
                      icon={<SaveOutlined />}
                      onClick={this.handleSubmit}
                      style={{ margin: 0 }}
                    >
                      Save Label
                    </Button>
                  </UserCan>
                </div>
              </div>
            </div>
          </DeviceDashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createLabel }, dispatch);
}

export default connect(null, mapDispatchToProps)(LabelNew);
