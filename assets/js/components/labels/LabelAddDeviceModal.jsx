import React, { Component } from "react";
import withGql from "../../graphql/withGql";
import omit from "lodash/omit";
import analyticsLogger from "../../util/analyticsLogger";
import { ALL_LABELS_DEVICES } from "../../graphql/labels";
import { Modal, Button, Typography, Tabs } from "antd";
import LabelAddDeviceSelect from "./LabelAddDeviceSelect";
import LabelAddLabelSelect from "./LabelAddLabelSelect";
const { Text } = Typography;
const { TabPane } = Tabs;

class LabelAddDeviceModal extends Component {
  state = {
    checkedDevices: {},
    checkedLabels: {},
  };

  handleSubmit = () => {
    const { checkedDevices, checkedLabels } = this.state;

    this.props.addDevicesToLabels(
      checkedDevices,
      checkedLabels,
      this.props.label.id
    ).then(response => {
      if (response.status === 200) {
        analyticsLogger.logEvent("ACTION_ADD_DEVICES_AND_LABELS_TO_LABEL", {
          id: this.props.label.id,
          devices: Object.keys(checkedDevices),
          labels: Object.keys(checkedLabels),
        });

        this.setState({
          checkedDevices: {},
          checkedLabels: {},
        })
      }
    })

    this.props.onClose();
  };

  checkAllDevices = (search) => {
    const { checkedDevices } = this.state;
    if (Object.keys(checkedDevices).length > 0) {
      this.setState({ checkedDevices: {} });
    } else if (search.length > 0) {
      const devices = {};
      search.forEach((d) => {
        devices[d.id] = true;
      });
      this.setState({ checkedDevices: devices });
    } else {
      const devices = {};
      this.props.allResourcesQuery.allDevices.forEach((d) => {
        devices[d.id] = true;
      });
      this.setState({ checkedDevices: devices });
    }
  };

  checkSingleDevice = (id) => {
    const { checkedDevices } = this.state;
    let devices;
    if (checkedDevices[id]) {
      devices = omit(checkedDevices, id);
    } else {
      devices = Object.assign({}, checkedDevices, { [id]: true });
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
        if (this.props.label.id !== l.id) labels[l.id] = true;
      });
      this.setState({ checkedLabels: labels });
    } else {
      const labels = {};
      this.props.allResourcesQuery.allLabels.forEach((l) => {
        if (this.props.label.id !== l.id) labels[l.id] = true;
      });
      this.setState({ checkedLabels: labels });
    }
  };

  checkSingleLabel = (id) => {
    const { checkedLabels } = this.state;
    let labels;

    if (checkedLabels[id]) {
      labels = omit(checkedLabels, id);
    } else {
      labels = Object.assign({}, checkedLabels, { [id]: true });
    }
    this.setState({ checkedLabels: labels });
  };

  render() {
    const { open, onClose, label, labelNormalizedDevices } = this.props;
    const { allDevices, allLabels, loading, error } =
      this.props.allResourcesQuery;
    const { checkedDevices, checkedLabels } = this.state;

    return (
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
          <Text>Data failed to load, please reload the page and try again</Text>
        )}
      </Modal>
    );
  }
}

export default withGql(LabelAddDeviceModal, ALL_LABELS_DEVICES, (props) => ({
  fetchPolicy: "network-only",
  variables: {},
  name: "allResourcesQuery",
}));
