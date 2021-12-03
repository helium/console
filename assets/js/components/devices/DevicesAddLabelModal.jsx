import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import withGql from "../../graphql/withGql";
import flatten from "lodash/flatten"
import analyticsLogger from "../../util/analyticsLogger";
import { ALL_LABELS } from "../../graphql/labels";
import { grayForModalCaptions } from "../../util/colors";
import { addDevicesToLabel, addDevicesToNewLabel } from "../../actions/label";
import { removeDevicesConfigProfiles } from "../../actions/device";
import LabelTag from "../common/LabelTag";
import { Modal, Button, Typography, Input, Select, Checkbox } from "antd";
const { Text } = Typography;
const { Option } = Select;
import ConfirmLabelAddProfileConflictModal from "../common/ConfirmLabelAddProfileConflictModal";

class DevicesAddLabelModal extends Component {
  state = {
    labelId: undefined,
    labelName: undefined,
    applyToAll: false,
    showLabelConfigProfileConflicts: false,
    showDeviceProfileConflictModal: false,
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
      const labelToApply = this.props.allLabelsQuery.allLabels.find(
        (l) => l.id === labelId
      );

      const devicesLabelsHaveConflicts =
        flatten(this.props.devicesToUpdate.map(d => d.labels))
        .find(l => l.config_profile_id !== null && l.config_profile_id !== labelToApply.config_profile_id)

      if (devicesLabelsHaveConflicts) {
        this.setState({ showLabelConfigProfileConflicts: true })
      } else {
        this.props.addDevicesToLabel(!applyToAll && deviceIds, labelId)
        .then((response) => {
          if (response.status === 204) {
            analyticsLogger.logEvent("ACTION_ADD_LABEL_TO_DEVICES", {
              devices: applyToAll ? "all" : deviceIds,
              label: labelId,
            });

            const devicesHaveConflictingProfiles =
              this.props.devicesToUpdate.find(d => d.config_profile_id !== null && d.config_profile_id !== labelToApply.config_profile_id)

            if (devicesHaveConflictingProfiles) {
              this.setState({ showDeviceProfileConflictModal: true })
            }
          }
        });
        this.setState({ applyToAll: false });
        this.props.onClose();
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
      this.setState({ applyToAll: false });
      this.props.onClose();
    }
  };

  handleConflictConfirm = (e) => {
    e.preventDefault();
    const { labelName, labelId, applyToAll } = this.state;
    const deviceIds = applyToAll
      ? []
      : this.props.devicesToUpdate.map((d) => d.id);

    const labelToApply = this.props.allLabelsQuery.allLabels.find(
      (l) => l.id === labelId
    );

    this.props.addDevicesToLabel(!applyToAll && deviceIds, labelId)
    .then((response) => {
      if (response.status === 204) {
        analyticsLogger.logEvent("ACTION_ADD_LABEL_TO_DEVICES", {
          devices: applyToAll ? "all" : deviceIds,
          label: labelId,
        });

        const devicesHaveConflictingProfiles =
          this.props.devicesToUpdate.find(d => d.config_profile_id !== null && d.config_profile_id !== labelToApply.config_profile_id)

        if (devicesHaveConflictingProfiles) {
          this.setState({ showDeviceProfileConflictModal: true })
        }
      }
    });
    this.setState({ applyToAll: false });
    this.props.onClose();
  }

  handleSelectOption = (labelId) => {
    this.setState({ labelId, labelName: null });
  };

  render() {
    const { open, onClose, devicesToUpdate, allDevicesSelected, totalDevices } =
      this.props;
    const { error, allLabels } = this.props.allLabelsQuery;
    const { labelName, labelId, showLabelConfigProfileConflicts } = this.state;

    return (
      <>
        {
          showLabelConfigProfileConflicts ? (
            <Modal
              title={
                `Do you want the new label & config profile to apply to ${
                  devicesToUpdate && devicesToUpdate.length > 1 ? "these devices?" : "this device?"
                }`
              }
              visible={open}
              centered
              onCancel={() => {
                this.setState({ showLabelConfigProfileConflicts: false })
                onClose()
              }}
              onOk={this.handleConflictConfirm}
              footer={[
                <Button
                  key="back"
                  onClick={() => {
                    this.setState({ showLabelConfigProfileConflicts: false })
                    onClose()
                  }}
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  onClick={this.handleConflictConfirm}
                  type="primary"
                >
                  Confirm
                </Button>,
              ]}
            >
              <Text style={{ display: 'block', marginBottom: 8 }}>The label you are trying to apply has a configuration profile that is different from label(s) previously attached to {devicesToUpdate && devicesToUpdate.length > 1 ? "these devices" : "this device"}.</Text>
              <Text style={{ display: 'block', marginBottom: 8 }}><Text strong>Confirm</Text> - {devicesToUpdate && devicesToUpdate.length > 1 ? "These devices" : "This device"} will follow the configuration profile settings of this new label.</Text>
              <Text style={{ display: 'block', marginBottom: 8 }}><Text strong>Cancel</Text> - {devicesToUpdate && devicesToUpdate.length > 1 ? "These devices" : "This device"} will retain configuration profile settings of preexisting labels. This new label will not be applied.</Text>
            </Modal>
          ) : (
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
          )
        }
        <ConfirmLabelAddProfileConflictModal
          open={this.state.showDeviceProfileConflictModal}
          close={() => {
            this.setState({ showDeviceProfileConflictModal: false });
          }}
          multipleDevices={devicesToUpdate && devicesToUpdate.length > 1}
          submit={() => {
            const labelToApply = this.props.allLabelsQuery.allLabels.find(
              (l) => l.id === this.state.labelId
            );

            const deviceIdsWithConflictingProfiles =
              this.props.devicesToUpdate.reduce((result, device) => {
                if (device.config_profile_id && device.config_profile_id !== labelToApply.config_profile_id) {
                  result.push(device);
                }
                return result;
              },
              []).map(d => d.id)

            this.props.removeDevicesConfigProfiles(deviceIdsWithConflictingProfiles)
          }}
        />
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { addDevicesToLabel, addDevicesToNewLabel, removeDevicesConfigProfiles },
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
