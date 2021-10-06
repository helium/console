import React, { Component } from "react";
import debounce from "lodash/debounce";
import { Checkbox, Input, Card } from "antd";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import CheckCircleFilled from "@ant-design/icons/CheckCircleFilled";
import withGql from "../../graphql/withGql";
import { SEARCH_DEVICES } from "../../graphql/search";

class LabelAddDeviceSelect extends Component {
  state = {
    searchDevices: [],
  };

  runSearch = (value) => {
    const { loading, refetch } = this.props.searchDevicesQuery;
    if (!loading) {
      refetch({ query: value }).then(({ data }) => {
        const { searchDevices } = data;

        this.setState({ searchDevices });
      });
    }
  };

  render() {
    const {
      checkAllDevices,
      allDevices,
      checkedDevices,
      checkSingleDevice,
      labelNormalizedDevices,
    } = this.props;

    const { searchDevices } = this.state;

    const debouncedSearch = debounce(this.runSearch, 300);

    return (
      <Card
        title={
          <Checkbox
            onChange={(e) => checkAllDevices(searchDevices)}
            checked={allDevices.length === Object.keys(checkedDevices).length}
          >
            Select All Devices
          </Checkbox>
        }
        size="small"
        style={{ height: 325, width: "100%" }}
      >
        <Input
          placeholder="Search here"
          suffix={<SearchOutlined />}
          onChange={(e) => debouncedSearch(e.target.value)}
          style={{ width: "100%", marginBottom: 5 }}
        />
        <div style={{ overflowY: "scroll", height: 202, width: "100%" }}>
          {searchDevices.length === 0 &&
            allDevices.map((d) => (
              <div style={{ marginTop: 5 }} key={d.id}>
                <Checkbox
                  onChange={() => checkSingleDevice(d.id, d.config_profile_id)}
                  checked={checkedDevices[d.id]}
                >
                  {d.name}
                </Checkbox>
                {labelNormalizedDevices[d.id] && (
                  <CheckCircleFilled style={{ color: "#4091F7" }} />
                )}
              </div>
            ))}
          {searchDevices.map((d) => (
            <div style={{ marginTop: 5 }} key={d.id}>
              <Checkbox
                onChange={() => checkSingleDevice(d.id)}
                checked={checkedDevices[d.id]}
              >
                {d.name}
              </Checkbox>
              {labelNormalizedDevices[d.id] && (
                <CheckCircleFilled style={{ color: "#4091F7" }} />
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  }
}

export default withGql(LabelAddDeviceSelect, SEARCH_DEVICES, (props) => ({
  fetchPolicy: "network-only",
  variables: { query: "" },
  name: "searchDevicesQuery",
}));
