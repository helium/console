import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import withGql from "../../graphql/withGql";
import analyticsLogger from "../../util/analyticsLogger";
import { ALL_LABELS } from "../../graphql/labels";
import { grayForModalCaptions } from "../../util/colors";
import { addDevicesToLabel, addDevicesToNewLabel } from "../../actions/label";
import LabelTag from "../common/LabelTag";
import { Modal, Button, Typography, Input, Select, Checkbox } from "antd";
const { Text } = Typography;
const { Option } = Select;
import ConfirmLabelAddProfileConflict from "../common/ConfirmLabelAddProfileConflict";

class DevicesAddLabelModal extends Component {
  state = {
    labelId: undefined,
    labelName: undefined,
    applyToAll: false,
    showConfirmModal: false,
  };

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value, labelId: undefined });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { labelName, labelId, applyToAll } = this.state;
    const deviceIds = applyToAll
      ? []
      : this.props.devicesToUpdate.map((d) => d.id);

    if (labelId) {
      const devicesProfiles = this.props.devicesToUpdate.reduce(
        (result, device) => {
          if (device.config_profile_id) {
            result.push(device.config_profile_id);
          }
          return result;
        },
        []
      );
      const labelToApply = this.props.allLabelsQuery.allLabels.find(
        (l) => l.id === labelId
      );
      if (
        labelToApply.config_profile_id &&
        devicesProfiles.some((p) => p !== labelToApply.config_profile_id)
      ) {
        this.setState({ showConfirmModal: true });
      } else {
        this.props
          .addDevicesToLabel(!applyToAll && deviceIds, labelId)
          .then((response) => {
            if (response.status === 204) {
              analyticsLogger.logEvent("ACTION_ADD_LABEL_TO_DEVICES", {
                devices: applyToAll ? "all" : deviceIds,
                label: labelId,
              });
            }
          });
      }
    } else if (labelName) {
      this.props
        .addDevicesToNewLabel(!applyToAll && deviceIds, labelName)
        .then((response) => {
          if (response.status === 204) {
            analyticsLogger.logEvent("ACTION_ADD_LABEL_TO_DEVICES", {
              devices: applyToAll ? "all" : deviceIds,
              label_name: labelName,
            });
          }
        });
    }
    this.setState({ applyToAll: false });

    this.props.onClose();
  };

  handleSelectOption = (labelId) => {
    this.setState({ labelId, labelName: null });
  };

  render() {
    const { open, onClose, devicesToUpdate, allDevicesSelected, totalDevices } =
      this.props;
    const { error, allLabels } = this.props.allLabelsQuery;
    const { labelName, labelId } = this.state;

    return (
      <>
        <Modal
          title={`Add Label to ${
            devicesToUpdate ? devicesToUpdate.length : 0
          } Device${devicesToUpdate && devicesToUpdate.length > 1 ? "s" : ""}`}
          visible={open}
          centered
          onCancel={onClose}
          onOk={this.handleSubmit}
          footer={[
            <Button key="back" onClick={onClose}>
              Cancel
            </Button>,
            <Button
              key="submit"
              onClick={this.handleSubmit}
              enabled={
                devicesToUpdate &&
                devicesToUpdate.length !== 0 &&
                (labelName || labelId)
              }
              type="primary"
            >
              Add Label
            </Button>,
          ]}
        >
          <div>
            <Select
              placeholder={error ? "No Labels found..." : "Choose Label"}
              style={{ width: 270, marginRight: 10 }}
              onSelect={this.handleSelectOption}
              value={labelId}
            >
              {allLabels &&
                allLabels.map((l) => (
                  <Option value={l.id} key={l.id}>
                    <LabelTag text={l.name} />
                  </Option>
                ))}
            </Select>
          </div>

          <div style={{ marginTop: 15, marginBottom: 15 }}>
            <Text style={{ color: grayForModalCaptions }}>or</Text>
          </div>

          <div>
            <Text>Add Label</Text>
            <Input
              placeholder="Enter Label Name"
              name="labelName"
              value={this.state.labelName}
              onChange={this.handleInputUpdate}
            />
            <Text style={{ marginBottom: 20, color: grayForModalCaptions }}>
              Label names must be unique
            </Text>
          </div>
          {allDevicesSelected && (
            <Checkbox
              style={{ marginTop: 20 }}
              checked={this.state.applyToAll}
              onChange={(e) => this.setState({ applyToAll: e.target.checked })}
            >
              {`Apply to all ${totalDevices} devices?`}
            </Checkbox>
          )}
        </Modal>
        <ConfirmLabelAddProfileConflict
          open={this.state.showConfirmModal}
          close={() => {
            this.setState({ showConfirmModal: false });
          }}
          submit={() => {
            const { applyToAll } = this.state;
            const deviceIds = applyToAll
              ? []
              : this.props.devicesToUpdate.map((d) => d.id);
            this.props
              .addDevicesToLabel(!applyToAll && deviceIds, labelId)
              .then((response) => {
                if (response.status === 204) {
                  analyticsLogger.logEvent("ACTION_ADD_LABEL_TO_DEVICES", {
                    devices: applyToAll ? "all" : deviceIds,
                    label: labelId,
                  });
                }
              });
          }}
          multipleDevices={
            this.props.devicesToUpdate && this.props.devicesToUpdate.length > 1
          }
        />
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { addDevicesToLabel, addDevicesToNewLabel },
    dispatch
  );
}

export default connect(
  null,
  mapDispatchToProps
)(
  withGql(DevicesAddLabelModal, ALL_LABELS, (props) => ({
    fetchPolicy: "cache-and-network",
    variables: {},
    name: "allLabelsQuery",
  }))
);
