import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import DragAndDrop, { style as dropStyle } from "../common/DragAndDrop";
import {
  createOrganization,
  importOrganization,
} from "../../actions/organization";
import analyticsLogger from "../../util/analyticsLogger";
import { blueForDeviceStatsLarge } from "../../util/colors";
import { displayError } from "../../util/messages";
import { Modal, Button, Input, Typography, Alert } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
const { Text } = Typography;
import { primaryBlue } from "../../util/colors";

@connect(null, mapDispatchToProps)
class NewOrganizationModal extends Component {
  state = {
    name: "",
    importing: false,
    importFailed: false,
  };

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  closeModal = () => {
    this.props.onClose();
    this.setState({ importFailed: false });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { name } = this.state;

    analyticsLogger.logEvent("ACTION_CREATE_ORG", { name: name });
    this.props.createOrganization(name);

    this.props.onClose();
    this.setState({ name: "" });
  };

  render() {
    const { open } = this.props;

    return (
      <Modal
        title="Add a new organization"
        visible={open}
        onCancel={this.closeModal}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={this.closeModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            Submit
          </Button>,
        ]}
      >
        <Input
          placeholder="New Organization Name"
          name="name"
          value={this.state.name}
          onChange={this.handleInputUpdate}
          style={{ marginBottom: 20 }}
        />
        <Text>or</Text>
        <div style={{ textAlign: "center" }}>
          <Text
            style={{
              color: primaryBlue,
              fontSize: 18,
              fontWeight: 300,
              display: "block",
            }}
          >
            Import Your Organization
          </Text>
        </div>
        {this.state.importFailed ? (
          <div style={dropStyle}>
            <Text
              style={{
                textAlign: "center",
                margin: "30px 40px",
                fontSize: 14,
                color: blueForDeviceStatsLarge,
              }}
            >
              <span style={{ display: "block", marginBottom: 10 }}>
                Failed to import organization with provided file
              </span>
              <Button
                size="small"
                onClick={() => this.setState({ importFailed: false })}
              >
                Try Again
              </Button>
            </Text>
          </div>
        ) : (
          <>
            <Alert
              type="warning"
              message="Ensure imported devices are deactivated on the original Console before attempting to rejoin them on this Console."
              style={{ fontSize: "16px", marginTop: 10, textAlign: "center" }}
            />
            <DragAndDrop
              fileSelected={(file) => {
                let fileReader = new FileReader();
                fileReader.onloadend = () => {
                  this.setState({ importing: true });

                  importOrganization(fileReader.result)
                    .then((resp) => {
                      this.props.onClose();
                      window.location.reload(true);
                    })
                    .catch((err) => {
                      this.setState({ importing: false, importFailed: true });
                    });
                };
                fileReader.readAsText(file);
              }}
            >
              {this.state.importing ? (
                <LoadingOutlined
                  style={{ fontSize: 50, color: "#38A2FF", margin: 20 }}
                  spin
                />
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    margin: "30px 40px",
                    fontSize: 16,
                    color: blueForDeviceStatsLarge,
                  }}
                >
                  Drag exported organization .json file here or click to choose
                  file
                </Text>
              )}
            </DragAndDrop>
          </>
        )}
      </Modal>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createOrganization }, dispatch);
}

export default NewOrganizationModal;
