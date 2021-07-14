import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import DebugEntry from "./DebugEntry";
import { debugSidebarHeaderColor, debugTextColor } from "../../util/colors";
import { Typography, Popover, Button, Checkbox, Tooltip } from "antd";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import ReloadOutlined from "@ant-design/icons/ReloadOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
const { Text } = Typography;
import Loader from "../../../img/debug-loader.png";

class Debug extends Component {
  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }

  state = {
    data: [],
    expandAll: false,
  };

  componentDidMount() {
    this.setState({ data: [] });

    const { socket, deviceId, labelId } = this.props;

    if (deviceId) {
      this.channel = socket.channel("graphql:device_show_debug", {});
      this.channel.join();
      this.channel.on(
        `graphql:device_show_debug:${this.props.deviceId}:get_event`,
        (message) => {
          this.updateData(message);
        }
      );
    }
    if (labelId) {
      this.channel = socket.channel("graphql:label_show_debug", {});
      this.channel.join();
      this.channel.on(
        `graphql:label_show_debug:${this.props.labelId}:get_event`,
        (message) => {
          this.updateData(message);
        }
      );
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (
      prevState.data.length > 0 &&
      prevState.data.length < this.state.data.length
    ) {
      const list = this.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  clearSingleEntry = (id) => {
    this.setState({
      data: this.state.data.filter((d) => d.id !== id),
    });
  };

  getUniqueRouterUuids = () => [
    ...new Set(this.state.data.map((e) => e.router_uuid)),
  ];

  updateData = (event) => {
    // since events come in deaggregated from router, limit to 10 unique router_uuids (incl. all its related events)
    const uniqueRouterUuids = this.getUniqueRouterUuids();
    if (
      !uniqueRouterUuids.includes(event.router_uuid) &&
      uniqueRouterUuids.length === 10
    )
      return;

    const { data } = this.state;
    this.setState({ data: [event].concat(data) });
  };

  toggleExpandAll = () => {
    this.setState({ expandAll: !this.state.expandAll });
  };

  render = () => {
    const { data, expandAll } = this.state;

    if (data.length === 0)
      return (
        <Fragment>
          {this.props.handleToggle && (
            <Tooltip title="Close">
              <Button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  marginRight: 10,
                  left: "35px",
                }}
                onClick={() => {
                  this.props.handleToggle();
                }}
                icon={
                  <CloseOutlined
                    style={{
                      fontSize: 30,
                      color: debugTextColor,
                    }}
                  />
                }
              />
            </Tooltip>
          )}
          <div
            style={{
              height: "calc(100% - 55px)",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              style={{ height: 22, width: 22, marginBottom: 5 }}
              className="rotate"
              src={Loader}
            />
            <Text style={{ color: debugTextColor }}>Waiting for data...</Text>
          </div>
        </Fragment>
      );
    return (
      <div
        style={{
          height: "calc(100% - 55px)",
          width: "100%",
          overflow: "scroll",
        }}
        className="no-scroll-bar"
        ref={this.listRef}
      >
        <div
          style={{
            width: "100%",
            backgroundColor: debugSidebarHeaderColor,
            padding: "25px 30px 25px 30px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            position: "absolute",
            top: 0,
          }}
        >
          {this.props.handleToggle && (
            <Tooltip title="Close">
              <Button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  marginRight: 10,
                }}
                onClick={() => {
                  this.props.handleToggle();
                }}
                icon={
                  <CloseOutlined
                    style={{
                      fontSize: 30,
                      color: "#D2DDE8",
                    }}
                  />
                }
              />
            </Tooltip>
          )}
          <Text style={{ color: "white" }}>
            <span style={{ fontWeight: "500" }}>Displaying</span>{" "}
            <span style={{ fontWeight: "300" }}>{data.length} / 40 Events</span>
          </Text>
          <Popover
            content="Debug mode only shows a limited amount of events at once. Click refresh to see more."
            placement="bottom"
            overlayStyle={{ width: 220 }}
          >
            <InfoCircleOutlined
              style={{ color: "white", fontSize: 18, marginLeft: 10 }}
            />
          </Popover>
          <div style={{ flexGrow: 1 }} />
          <Checkbox
            onChange={() => this.toggleExpandAll()}
            checked={expandAll}
            style={{ marginRight: 20, color: "white" }}
          >
            Expand All
          </Checkbox>
          <Tooltip title="Refresh">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              shape="circle"
              onClick={() => {
                this.setState({ data: [] });
              }}
            />
          </Tooltip>
        </div>
        <div style={{ width: "100%", marginTop: 50 }}>
          {data.map((d) => (
            <span key={d.id}>
              <DebugEntry
                event={d}
                clearSingleEntry={this.clearSingleEntry}
                expandAll={expandAll}
                width={this.props.entryWidth || 600}
              />
            </span>
          ))}
        </div>
      </div>
    );
  };
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  };
}

export default connect(mapStateToProps, null)(Debug);
