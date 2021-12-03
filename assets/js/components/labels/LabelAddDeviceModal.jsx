import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import withGql from "../../graphql/withGql";
import omit from "lodash/omit";
import flatten from "lodash/flatten"
import uniq from "lodash/uniq"
import analyticsLogger from "../../util/analyticsLogger";
import { removeDevicesConfigProfiles } from "../../actions/device";
import { ALL_LABELS_DEVICES } from "../../graphql/labels";
import { Modal, Button, Typography, Tabs } from "antd";
import LabelAddDeviceSelect from "./LabelAddDeviceSelect";
import LabelAddLabelSelect from "./LabelAddLabelSelect";
const { Text } = Typography;
const { TabPane } = Tabs;
import ConfirmLabelAddProfileConflictModal from "../common/ConfirmLabelAddProfileConflictModal";

class LabelAddDeviceModal extends Component {
  state = {
    checkedDevices: {},
    checkedLabels: {},
    showLabelConfigProfileConflicts: false,
    showDeviceProfileConflictModal: false
  };

  handleSubmit = () => {
    const { checkedDevices, checkedLabels } = this.state;
    const labelToApply = this.props.allResourcesQuery.allLabels.find(
      (l) => l.id === this.props.label.id
    );

    const devicesLabelsHaveConflicts =
      flatten(Object.values(checkedDevices).map(d => d.labels))
      .find(l => l.config_profile_id !== null && l.config_profile_id !== labelToApply.config_profile_id)

    if (devicesLabelsHaveConflicts) {
      this.setState({ showLabelConfigProfileConflicts: true })
    } else {
      this.props.addDevicesToLabels(checkedDevices, checkedLabels, this.props.label.id)
      .then((response) => {
        if (response.status === 200) {
          analyticsLogger.logEvent("ACTION_ADD_DEVICES_AND_LABELS_TO_LABEL", {
            id: this.props.label.id,
            devices: Object.keys(checkedDevices),
            labels: Object.keys(checkedLabels),
          });

          const devicesHaveConflictingProfiles =
            Object.values(checkedDevices)
            .concat(flatten(Object.values(checkedLabels).map(l => l.devices)))
            .find(d => d.config_profile_id !== null && d.config_profile_id !== labelToApply.config_profile_id)

          if (devicesHaveConflictingProfiles) {
            this.setState({ showDeviceProfileConflictModal: true })
          }
        }
      });

      this.props.onClose();
    }
  };

  handleConflictConfirm = (e) => {
    e.preventDefault();
    const { checkedDevices, checkedLabels } = this.state;
    const labelToApply = this.props.allResourcesQuery.allLabels.find(
      (l) => l.id === this.props.label.id
    );

    this.props.addDevicesToLabels(checkedDevices, checkedLabels, this.props.label.id)
    .then((response) => {
      if (response.status === 200) {
        analyticsLogger.logEvent("ACTION_ADD_DEVICES_AND_LABELS_TO_LABEL", {
          id: this.props.label.id,
          devices: Object.keys(checkedDevices),
          labels: Object.keys(checkedLabels),
        });

        const devicesHaveConflictingProfiles =
          Object.values(checkedDevices)
          .concat(flatten(Object.values(checkedLabels).map(l => l.devices)))
          .find(d => d.config_profile_id !== null && d.config_profile_id !== labelToApply.config_profile_id)

        if (devicesHaveConflictingProfiles) {
          this.setState({ showDeviceProfileConflictModal: true })
        }
      }
    });

    this.props.onClose();
  }

  checkAllDevices = (search) => {
    const { checkedDevices } = this.state;
    if (Object.keys(checkedDevices).length > 0) {
      this.setState({ checkedDevices: {} });
    } else if (search.length > 0) {
      const devices = {};
      search.forEach((d) => {
        devices[d.id] = d;
      });
      this.setState({ checkedDevices: devices });
    } else {
      const devices = {};
      this.props.allResourcesQuery.allDevices.forEach((d) => {
        devices[d.id] = d;
      });
      this.setState({ checkedDevices: devices });
    }
  };

  checkSingleDevice = (id, device) => {
    const { checkedDevices } = this.state;
    let devices;
    if (checkedDevices[id]) {
      devices = omit(checkedDevices, id);
    } else {
      devices = Object.assign({}, checkedDevices, {
        [id]: device,
      });
    }
    this.setState({ checkedDevices: devices });
  };

  checkAllLabels = (search) => {
    const { checkedLabels } = this.state;
    if (Object.keys(checkedLabels).length > 0) {
      this.setState({ checkedLabels: {} });
    } else if (search.length > 0) {
      const labels = {};
      search.forEach((l) => {
        labels[l.id] = l
      });
      this.setState({ checkedLabels: labels });
    } else {
      const labels = {};
      this.props.allResourcesQuery.allLabels.forEach((l) => {
        labels[l.id] = l
      });
      this.setState({ checkedLabels: labels });
    }
  };

  checkSingleLabel = (id, label) => {
    const { checkedLabels } = this.state;
    let labels;

    if (checkedLabels[id]) {
      labels = omit(checkedLabels, id);
    } else {
      labels = Object.assign({}, checkedLabels, {
        [id]: label,
      });
    }
    this.setState({ checkedLabels: labels });
  };

  render() {
    const { open, onClose, label, labelNormalizedDevices } = this.props;
    const { allDevices, allLabels, loading, error } =
      this.props.allResourcesQuery;
    const { checkedDevices, checkedLabels, showLabelConfigProfileConflicts } = this.state;
    const allAffectedDevices = uniq(
      Object.values(this.state.checkedDevices)
      .concat(flatten(Object.values(checkedLabels).map(l => l.devices)))
      .map(d => d.id)
    )

    return (
      <>
        {
          showLabelConfigProfileConflicts ? (
            <Modal
              title={
                `Do you want the new label & config profile to apply to ${
                  allAffectedDevices.length > 1 ? "these devices?" : "this device?"
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
              <Text style={{ display: 'block', marginBottom: 8 }}>The label you are trying to apply has a configuration profile that is different from label(s) previously attached to {allAffectedDevices.length > 1 ? "these devices" : "this device"}.</Text>
              <Text style={{ display: 'block', marginBottom: 8 }}><Text strong>Confirm</Text> - {allAffectedDevices.length > 1 ? "These devices" : "This device"} will follow the configuration profile settings of this new label.</Text>
              <Text style={{ display: 'block', marginBottom: 8 }}><Text strong>Cancel</Text> - {allAffectedDevices.length > 1 ? "These devices" : "This device"} will retain configuration profile settings of preexisting labels. This new label will not be applied.</Text>
            </Modal>
          ) : (
            <Modal
              title="Which Devices do you want to add this Label to?"
              visible={open}
              onCancel={onClose}
              centered
              onOk={this.handleSubmit}
              footer={[
                <Button key="back" onClick={onClose}>
                  Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={this.handleSubmit}>
                  Add Label to Devices
                </Button>,
              ]}
              width={620}
            >
              {!loading && !error && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Tabs
                    defaultActiveKey="devices"
                    size="small"
                    onTabClick={(tab) => this.setState({ tab })}
                    tabPosition="left"
                    style={{ width: "100%", height: 325 }}
                  >
                    <TabPane tab="Devices" key="devices">
                      <LabelAddDeviceSelect
                        checkAllDevices={this.checkAllDevices}
                        allDevices={allDevices}
                        checkedDevices={checkedDevices}
                        checkSingleDevice={this.checkSingleDevice}
                        labelNormalizedDevices={labelNormalizedDevices}
                      />
                    </TabPane>
                    <TabPane tab="Labels" key="labels">
                      <Text strong>
                        Choose additional labels with devices that you want attached
                        to the current label, {label.name}:
                      </Text>
                      <LabelAddLabelSelect
                        checkAllLabels={this.checkAllLabels}
                        allLabelsWithDevices={allLabels.filter(
                          (l) => l.device_count && l.device_count > 0
                        )}
                        checkedLabels={checkedLabels}
                        checkSingleLabel={this.checkSingleLabel}
                        currentLabel={label}
                      />
                    </TabPane>
                  </Tabs>
                </div>
              )}
              {error && (
                <Text>
                  Data failed to load, please reload the page and try again
                </Text>
              )}
            </Modal>
          )
        }
        <ConfirmLabelAddProfileConflictModal
          open={this.state.showDeviceProfileConflictModal}
          close={() => {
            this.setState({ showDeviceProfileConflictModal: false });
          }}
          multipleDevices={
            allAffectedDevices.length > 1
          }
          submit={() => {
            const labelToApply = this.props.allResourcesQuery.allLabels.find(
              (l) => l.id === this.props.label.id
            );

            const deviceIdsWithConflictingProfiles =
              Object.values(this.state.checkedDevices)
              .concat(flatten(Object.values(checkedLabels).map(l => l.devices)))
              .reduce((result, device) => {
                if (device.config_profile_id && device.config_profile_id !== labelToApply.config_profile_id) {
                  result.push(device);
                }
                return result;
              },
              []).map(d => d.id)

            this.props.removeDevicesConfigProfiles(uniq(deviceIdsWithConflictingProfiles))
          }}
        />
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { removeDevicesConfigProfiles },
    dispatch
  );
}

export default connect(
  null,
  mapDispatchToProps
)(
  withGql(LabelAddDeviceModal, ALL_LABELS_DEVICES, (props) => ({
    fetchPolicy: "network-only",
    variables: {},
    name: "allResourcesQuery",
  }))
)
