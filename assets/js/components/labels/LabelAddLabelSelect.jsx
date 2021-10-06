import React, { Component } from "react";
import debounce from "lodash/debounce";
import { Checkbox, Input, Card } from "antd";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import withGql from "../../graphql/withGql";
import { SEARCH_LABELS } from "../../graphql/search";

class LabelAddLabelSelect extends Component {
  state = {
    searchLabels: [],
  };

  runSearch = (value) => {
    const { loading, refetch } = this.props.searchLabelsQuery;
    const allLabelsWithDevicesMap = this.props.allLabelsWithDevices.reduce(
      (acc, l) => Object.assign({}, acc, { [l.id]: true }),
      {}
    );
    if (!loading) {
      refetch({ query: value }).then(({ data }) => {
        const { searchLabels } = data;

        this.setState({
          searchLabels: searchLabels.filter(
            (l) => allLabelsWithDevicesMap[l.id]
          ),
        });
      });
    }
  };

  render() {
    const {
      checkAllLabels,
      allLabelsWithDevices,
      checkedLabels,
      checkSingleLabel,
      currentLabel,
    } = this.props;

    const { searchLabels } = this.state;

    const debouncedSearch = debounce(this.runSearch, 300);

    return (
      <Card
        title={
          <Checkbox
            onChange={(e) => checkAllLabels(searchLabels)}
            checked={
              allLabelsWithDevices.length === Object.keys(checkedLabels).length
            }
          >
            Select All Labels
          </Checkbox>
        }
        size="small"
        style={{ height: 280, width: "100%" }}
      >
        <Input
          placeholder="Search here"
          suffix={<SearchOutlined />}
          onChange={(e) => debouncedSearch(e.target.value)}
          style={{ width: "100%", marginBottom: 5 }}
        />
        <div style={{ overflowY: "scroll", height: 150, width: "100%" }}>
          {searchLabels.length === 0 &&
            allLabelsWithDevices.map((l) => {
              if (l.id === currentLabel.id) return;
              return (
                <div style={{ marginTop: 5 }} key={l.id}>
                  <Checkbox
                    onChange={() =>
                      checkSingleLabel(
                        l.id,
                        l.devices.reduce((result, device) => {
                          if (device.config_profile_id) {
                            result.push(device.config_profile_id);
                          }
                          return result;
                        }, [])
                      )
                    }
                    checked={checkedLabels[l.id]}
                  >
                    {l.name}
                  </Checkbox>
                </div>
              );
            })}
          {searchLabels.map((l) => {
            if (l.id === currentLabel.id) return;
            return (
              <div style={{ marginTop: 5 }} key={l.id}>
                <Checkbox
                  onChange={() => checkSingleLabel(l.id)}
                  checked={checkedLabels[l.id]}
                >
                  {l.name}
                </Checkbox>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }
}

export default withGql(LabelAddLabelSelect, SEARCH_LABELS, (props) => ({
  fetchPolicy: "network-only",
  variables: { query: "" },
  name: "searchLabelsQuery",
}));
