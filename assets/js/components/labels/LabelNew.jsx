import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createLabel } from "../../actions/label";
import { grayForModalCaptions } from "../../util/colors";
import analyticsLogger from "../../util/analyticsLogger";
import DeviceDashboardLayout from "../devices/DeviceDashboardLayout";
import UserCan from "../common/UserCan";
import { Card, Button, Typography, Input } from "antd";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
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

  render() {
    return (
      <DeviceDashboardLayout {...this.props}>
        <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
          <div style={{ padding: "30px 30px 20px 30px", minWidth: 700 }}>
            <Card title="Enter Label Details">
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
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createLabel }, dispatch);
}

export default connect(null, mapDispatchToProps)(LabelNew);
