import React, { Component } from "react";
import { connect } from "react-redux";
import { formatDatetime, getDiffInSeconds } from "../../util/time";
import analyticsLogger from "../../util/analyticsLogger";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import PacketGraph from "../common/PacketGraph";
import { DEVICE_EVENTS } from "../../graphql/events";
import withGql from "../../graphql/withGql";
import { downlinkMacMap, uplinkMacMap } from "./constants";
import {
  Badge,
  Card,
  Typography,
  Table,
  Tag,
  Popover,
  Button,
  Checkbox,
  Tooltip,
  Tabs,
} from "antd";
const { TabPane } = Tabs;
import CaretDownOutlined from "@ant-design/icons/CaretDownOutlined";
import CaretUpOutlined from "@ant-design/icons/CaretUpOutlined";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import InfoOutlined from "@ant-design/icons/InfoOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import ShrinkOutlined from "@ant-design/icons/ShrinkOutlined";
import SettingFilled from "@ant-design/icons/SettingFilled";
const { Text } = Typography;
import { SkeletonLayout } from "../common/SkeletonLayout";
import { bindActionCreators } from "redux";
import { getAllEvents } from "../../actions/device";

const styles = {
  tag: {
    borderRadius: 9999,
    paddingBottom: 0,
    paddingRight: 9,
    fontSize: 14,
  },
};

//https://stackoverflow.com/questions/39460182/decode-base64-to-hexadecimal-string-with-javascript
const base64ToHex = (str) => {
  const raw = atob(str);
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : "0" + hex;
  }
  return result.toUpperCase();
};

const integrationErrorTag = () => (
  <Tooltip title="Integration Response Error">
    <ShrinkOutlined style={{ color: "red", fontSize: 20 }} />
  </Tooltip>
);

const integrationMissingTag = () => (
  <Tooltip title="No Integration Attached">
    <ShrinkOutlined style={{ color: "grey", fontSize: 20 }} />
  </Tooltip>
);

const categoryTag = (category, subCategories, integrationError) => {
  switch (category) {
    case "uplink_dropped":
      return <Text>Uplink Dropped</Text>;
    case "uplink":
      return <Text>Uplink</Text>;
    case "downlink_dropped":
      return <Text>Downlink Dropped</Text>;
    case "downlink":
      if (subCategories.includes("downlink_queued")) {
        return <Text>Downlink Queued</Text>;
      } else if (subCategories.includes("downlink_ack")) {
        return <Text>Acknowledge</Text>;
      } else {
        return <Text>Downlink</Text>;
      }
    case "join_request":
      return <Text>Join Request</Text>;
    case "join_accept":
      return <Text>Join Accept</Text>;
    case "misc":
      return <Text>Misc. Integration Error</Text>;
  }
};

const statusBadge = (status) => {
  switch (status) {
    case "error":
      return <Badge status="error" />;
    case "success":
      return <Badge status="success" />;
    default:
      return <Badge status="default" />;
  }
};

const messageType = (subCategory) => {
  const messageTypes = {
    uplink_integration_req: "Integration Request",
    uplink_integration_res: "Integration Response",
  };
  return messageTypes[subCategory];
};

class EventsDashboard extends Component {
  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }

  state = {
    rows: [],
    expandedRowKeys: [],
    expandAll: false,
    showLate: false,
    showInactive: false,
    showMacEventsOnly: false,
    tab: "general",
  };

  componentDidUpdate(prevProps) {
    const { deviceEvents, loading } = this.props.deviceEventsQuery;
    const { socket } = this.props;

    if (prevProps.deviceEventsQuery.loading && !loading) {
      this.setState({ rows: deviceEvents }, () => {
        this.channel = socket.channel("graphql:events_dashboard", {});
        this.channel.join();
        this.channel.on(
          `graphql:events_dashboard:${this.props.device_id}:new_event`,
          (message) => {
            this.addEvent(message);
          }
        );
      });
    }
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  addEvent = (event) => {
    const { rows, expandAll } = this.state;
    const expandedRowKeys = expandAll
      ? this.state.expandedRowKeys.concat(event.id)
      : this.state.expandedRowKeys;

    const lastEvent = rows[rows.length - 1];
    if (
      rows.length > 100 &&
      getDiffInSeconds(parseInt(lastEvent.reported_at)) > 300
    ) {
      const lastRouterId = lastEvent.router_uuid;
      this.setState({
        rows: [event].concat(
          rows.filter((event) => event.router_uuid !== lastRouterId)
        ),
        expandedRowKeys,
      });
    } else {
      this.setState({
        rows: [event].concat(rows),
        expandedRowKeys,
      });
    }
  };

  toggleExpandAll = (aggregatedRows) => {
    if (this.state.expandAll) {
      this.setState({ expandAll: false, expandedRowKeys: [] });
    } else {
      this.setState(
        { expandAll: true, expandedRowKeys: aggregatedRows.map((r) => r.id) },
        () => {
          this.listRef.current.scrollIntoView(); // prevent scrolling to bottom
        }
      );
    }
  };

  toggleShowLate = () => {
    this.setState({ showLate: !this.state.showLate });
  };

  toggleShowInactive = () => {
    this.setState({ showInactive: !this.state.showInactive });
  };

  toggleShowMacEventsOnly = () => {
    this.setState({ showMacEventsOnly: !this.state.showMacEventsOnly });
  };

  onExpandRow = (expandRow, row) => {
    if (expandRow) {
      this.setState({
        expandedRowKeys: this.state.expandedRowKeys.concat(row.id),
      });
    } else {
      this.setState({
        expandAll: false,
        expandedRowKeys: this.state.expandedRowKeys.filter(
          (id) => id != row.id
        ),
      });
    }
  };

  renderMacInfoTable = (mac, macMap) => {
    return (
      <React.Fragment>
        {Object.keys(mac).length > 1 && mac.command in macMap ? (
          macMap[mac.command].map((i) => (
            <tr>
              <td>
                <Text strong>{i.title}</Text>
              </td>
              <td>{mac[i.key]}</td>
            </tr>
          ))
        ) : (
          <Text>No additional information</Text>
        )}
      </React.Fragment>
    );
  };

  renderExpandedTabs = (record) => {
    const lorawanColumns = [
      { title: "Payload Size", dataIndex: "payload_size" },
      { title: "Port", dataIndex: "port" },
      { title: "Devaddr", dataIndex: "devaddr" },
    ];

    let hotspotColumns;
    if (record.category === "downlink") {
      hotspotColumns = [
        { title: "Hotspot Name", dataIndex: "name" },
        {
          title: "Frequency",
          dataIndex: "frequency",
          render: (data) => (
            <span>{(Math.round(data * 100) / 100).toFixed(2)}</span>
          ),
        },
        { title: "Spreading", dataIndex: "spreading" },
        {
          title: "Time",
          dataIndex: "time",
          render: (data) => (
            <Text style={{ textAlign: "left" }}>{formatDatetime(data)}</Text>
          ),
        },
      ];
    } else {
      hotspotColumns = [
        { title: "Hotspot Name", dataIndex: "name" },
        { title: "RSSI", dataIndex: "rssi" },
        {
          title: "SNR",
          dataIndex: "snr",
          render: (data) => (
            <span>{(Math.round(data * 100) / 100).toFixed(2)}</span>
          ),
        },
        {
          title: "Frequency",
          dataIndex: "frequency",
          render: (data) => (
            <span>{(Math.round(data * 100) / 100).toFixed(2)}</span>
          ),
        },
        { title: "Spreading", dataIndex: "spreading" },
        {
          title: "Time",
          dataIndex: "time",
          render: (data) => (
            <Text style={{ textAlign: "left" }}>{formatDatetime(data)}</Text>
          ),
        },
      ];
    }

    let channelColumns;
    if (record.category === "uplink") {
      channelColumns = [
        { title: "Integration Name", dataIndex: "name" },
        {
          title: "Status",
          render: (data, record) => (
            <Text>
              {statusBadge(record.status)}
              {record.status}
            </Text>
          ),
        },
        {
          title: "Time",
          dataIndex: "time",
          render: (data) => (
            <Text style={{ textAlign: "left" }}>{formatDatetime(data)}</Text>
          ),
        },
        {
          title: "Message Type",
          dataIndex: "subCategory",
          render: (data) => messageType(data),
        },
      ];
    } else {
      channelColumns = [
        { title: "Integration Name", dataIndex: "name" },
        {
          title: "Status",
          render: (data, record) => (
            <Text>
              {statusBadge(record.status)}
              {record.status}
            </Text>
          ),
        },
        {
          title: "Time",
          dataIndex: "time",
          render: (data) => (
            <Text style={{ textAlign: "left" }}>{formatDatetime(data)}</Text>
          ),
        },
      ];
    }

    return (
      <Tabs
        defaultActiveKey="general"
        size="large"
        centered
        onTabClick={(tab) => this.setState({ tab })}
      >
        <TabPane tab="General" key="general">
          <Card bodyStyle={{ padding: 0 }}>
            <Table
              columns={lorawanColumns}
              dataSource={[record]}
              pagination={false}
              rowKey={(record) => record.id}
            />
          </Card>
        </TabPane>
        {record.hotspots && (
          <TabPane tab={`Hotspots (${record.hotspots.length})`} key="hotspots">
            <Card bodyStyle={{ padding: 0 }}>
              <Table
                columns={hotspotColumns}
                dataSource={record.hotspots}
                pagination={false}
                rowKey={(record) => record.id}
              />
            </Card>
          </TabPane>
        )}
        {record.integrations && (
          <TabPane
            tab={`Integration Messages (${record.integrations.length})`}
            key="integrations"
          >
            <Card bodyStyle={{ padding: 0 }}>
              <Table
                columns={channelColumns}
                dataSource={record.integrations}
                pagination={false}
                rowKey={(record) => record.id}
              />
            </Card>
          </TabPane>
        )}
        {record.mac && record.mac.length > 0 && (
          <TabPane tab={`MAC Commands (${record.mac.length})`} key="mac">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {record.mac.map((mac, index) => {
                return (
                  <div
                    style={{ width: "25%", float: "left" }}
                    key={mac.command + index}
                  >
                    <Card
                      size="small"
                      title={mac.command}
                      style={
                        index !== 0 && (index + 1) % 4 === 0
                          ? {}
                          : { marginRight: "10px" }
                      }
                    >
                      <table>
                        <tbody>
                          {this.renderMacInfoTable(
                            mac,
                            record.category === "uplink"
                              ? uplinkMacMap
                              : downlinkMacMap
                          )}
                        </tbody>
                      </table>
                    </Card>
                  </div>
                );
              })}
            </div>
          </TabPane>
        )}
      </Tabs>
    );
  };

  renderFrameIcons = (row) => {
    switch (row.category) {
      case "uplink_dropped":
        return (
          <span>
            <Tag style={styles.tag} color="#D9D9D9">
              <CloseOutlined
                style={{
                  fontSize: 16,
                  marginRight: 3,
                  position: "relative",
                  top: 1.5,
                }}
              />
              {row.fct}
            </Tag>
            <Popover
              content={row.description}
              placement="top"
              overlayStyle={{ width: 220 }}
            >
              <Tag
                style={{ ...styles.tag, paddingRight: 0, cursor: "pointer" }}
                color="#D9D9D9"
              >
                <InfoOutlined style={{ marginLeft: -4, marginRight: 3 }} />
              </Tag>
            </Popover>
          </span>
        );
      case "uplink":
        return (
          <Tag style={styles.tag} color="#4091F7">
            <CaretUpOutlined style={{ marginRight: 1 }} />
            {row.fct}
          </Tag>
        );
      case "downlink_dropped":
        return (
          <span>
            <Tag style={styles.tag} color="#D9D9D9">
              <CloseOutlined
                style={{
                  fontSize: 16,
                  marginRight: 3,
                  position: "relative",
                  top: 1.5,
                }}
              />
              {row.fct}
            </Tag>
            <Popover
              content={row.description}
              placement="top"
              overlayStyle={{ width: 220 }}
            >
              <Tag
                style={{ ...styles.tag, paddingRight: 0, cursor: "pointer" }}
                color="#D9D9D9"
              >
                <InfoOutlined style={{ marginLeft: -4, marginRight: 3 }} />
              </Tag>
            </Popover>
          </span>
        );
      case "downlink":
        if (
          row &&
          row.sub_categories &&
          row.sub_categories.includes("downlink_queued")
        ) {
          return (
            <Tag style={styles.tag} color="#FA541C">
              <CaretDownOutlined />
            </Tag>
          );
        } else {
          return (
            <Tag style={styles.tag} color="#FA541C">
              <CaretDownOutlined style={{ marginRight: 1 }} />
              {row.fct}
            </Tag>
          );
        }
      case "join_request":
        return (
          <Tag style={styles.tag} color="#4091F7">
            <CheckOutlined style={{ fontSize: 12, marginRight: 3 }} />
            {row.fct}
          </Tag>
        );
      case "join_accept":
        return (
          <Tag style={styles.tag} color="#FA541C">
            <CheckOutlined style={{ fontSize: 12, marginRight: 3 }} />
            {row.fct}
          </Tag>
        );
      case "misc":
        return (
          <Tag style={styles.tag} color="#D9D9D9">
            <CloseOutlined
              style={{
                fontSize: 16,
                marginRight: 3,
                position: "relative",
                top: 1.5,
              }}
            />
          </Tag>
        );
    }
  };

  renderMacCommandIcons = (row) => {
    return (
      row.mac &&
      row.mac.length > 0 && (
        <Tooltip title="MAC Command(s)">
          <Tag
            style={styles.tag}
            color={`${row.category === "uplink" ? "#4091F7" : "#FA541C"}`}
          >
            <SettingFilled />
          </Tag>
        </Tooltip>
      )
    );
  };

  renderEventIcons = (row) => {
    return (
      <React.Fragment>
        {this.renderFrameIcons(row)}
        {this.renderMacCommandIcons(row)}
      </React.Fragment>
    );
  };

  isDataString = (data) => {
    return typeof data === "string";
  };

  render() {
    const {
      rows,
      expandedRowKeys,
      expandAll,
      showLate,
      showInactive,
      showMacEventsOnly,
    } = this.state;

    // events will come in separately and related events will have same router_uuid
    let aggregatedRows = Object.values(groupBy(rows, "router_uuid")).map(
      (routerEvents) => {
        const orderedRouterEvents = sortBy(routerEvents, ["reported_at"]);

        // grab the oldest one unless it's from the specified sub_categories which will not have fcnt
        let firstEvent =
          orderedRouterEvents.find(
            (e) =>
              ![
                "uplink_integration_req",
                "uplink_integration_res",
                "misc_integration_error",
              ].includes(e.sub_category)
          ) || orderedRouterEvents[0];

        // data field might initially come in as json when new event is added but normally won't
        let firstEventData = firstEvent.data;
        if (this.isDataString(firstEvent.data)) {
          firstEventData = JSON.parse(firstEvent.data);
        }

        return {
          id: firstEvent.router_uuid,
          description: firstEvent.description,
          reported_at: firstEvent.reported_at,
          category: firstEvent.category,
          sub_categories: orderedRouterEvents.map((e) => e.sub_category),
          fct:
            firstEvent.frame_down !== null
              ? firstEvent.frame_down
              : firstEvent.frame_up,
          payload_size: firstEventData.payload_size,
          port: firstEventData.port,
          devaddr: firstEventData.devaddr,
          mac: firstEventData.mac,
          hotspots: orderedRouterEvents
            .filter((event) =>
              this.isDataString(event.data)
                ? JSON.parse(event.data).hotspot
                : event.data.hotspot
            )
            .map((he) => ({
              ...(this.isDataString(he.data)
                ? JSON.parse(he.data).hotspot
                : he.data.hotspot),
              time: he.reported_at,
            })),
          integrations: orderedRouterEvents
            .filter((event) =>
              this.isDataString(event.data)
                ? JSON.parse(event.data).integration
                : event.data.integration
            )
            .map((ie) => ({
              ...(this.isDataString(ie.data)
                ? JSON.parse(ie.data).integration
                : ie.data.integration),
              description: ie.description,
              time: ie.reported_at,
              subCategory: ie.sub_category,
            })),
        };
      }
    );

    aggregatedRows.sort((a, b) => (a.reported_at < b.reported_at ? 1 : -1));

    // prevent orphaning events since they come in decoupled
    if (aggregatedRows.length > 100)
      aggregatedRows.splice(aggregatedRows.length - 5);

    // handle filtering of dropped uplinks
    if (!this.state.showInactive) {
      aggregatedRows = aggregatedRows.filter(
        (row) => row.sub_categories[0] !== "uplink_dropped_device_inactive"
      );
    }

    if (!this.state.showLate) {
      aggregatedRows = aggregatedRows.filter(
        (row) => row.sub_categories[0] !== "uplink_dropped_late"
      );
    }

    if (this.state.showMacEventsOnly) {
      aggregatedRows = aggregatedRows.filter(
        (row) => row.mac && row.mac.length > 0
      );
    }

    const columns = [
      {
        title: "Event",
        dataIndex: "data",
        render: (data, row) => this.renderEventIcons(row),
      },
      {
        title: "Type",
        dataIndex: "category",
        render: (data, row) => {
          const integrationResponses = row.integrations
            ? row.integrations.filter(
                (i) => i.subCategory === "uplink_integration_res"
              )
            : [];
          const integrationError =
            integrationResponses.findIndex((i) => i.status === "error") === -1
              ? false
              : true;

          const externalIntegrations = row.integrations
            ? row.integrations.filter((i) => i.name !== "Internal Integration")
            : [];
          const missingExternalIntegration =
            externalIntegrations.findIndex((i) => i.id === "no_channel") !== -1;
          const onlyInternalIntegration =
            row.integrations &&
            row.integrations.length > 0 &&
            externalIntegrations.length === 0;
          const integrationMissing =
            missingExternalIntegration || onlyInternalIntegration
              ? true
              : false;

          return (
            <Text>
              {categoryTag(row.category, row.sub_categories)}{" "}
              {integrationError && integrationErrorTag()}
              {integrationMissing && integrationMissingTag()}
            </Text>
          );
        },
      },
      {
        title: "No. of Hotspots",
        dataIndex: "hotspots",
        render: (data, row) =>
          data && data.length ? <Text>{data.length}</Text> : <Text>0</Text>,
      },
      {
        title: "Time",
        dataIndex: "reported_at",
        align: "left",
        render: (data) => (
          <Text style={{ textAlign: "left" }}>{formatDatetime(data)}</Text>
        ),
      },
    ];

    const { loading, error } = this.props.deviceEventsQuery;

    if (loading) return <SkeletonLayout />;
    if (error)
      return (
        <Text>Data failed to load, please reload the page and try again</Text>
      );

    return (
      <div style={{ minWidth: 800 }}>
        <div
          style={{
            padding: "20px 20px 0px 20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <span>
            <div className="chart-legend-bulb red"></div>
            <Text>Live Data</Text>
          </span>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text style={{ fontSize: 12 }}>
              <div
                className="chart-legend-bulb"
                style={{ backgroundColor: "rgba(33, 150, 243, 0.5)" }}
              ></div>
              Integration Success
            </Text>
            <Text style={{ fontSize: 12 }}>
              <div
                className="chart-legend-bulb"
                style={{ backgroundColor: "rgba(255, 165, 0, 0.5)" }}
              ></div>
              Integration Error
            </Text>
            <Text style={{ fontSize: 12 }}>
              <div
                className="chart-legend-bulb"
                style={{ backgroundColor: "rgba(255, 0, 0, 0.5)" }}
              ></div>
              No Integration
            </Text>
          </div>
        </div>
        <div style={{ padding: "0px 20px 20px 20px", boxSizing: "border-box" }}>
          <PacketGraph events={aggregatedRows} />
        </div>
        <div
          style={{
            padding: 20,
            width: "100%",
            background: "#F6F8FA",
            borderBottom: "1px solid #e1e4e8",
            borderTop: "1px solid #e1e4e8",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            <Text strong style={{ fontSize: 17, color: "rgba(0, 0, 0, 0.85)" }}>
              Event Log
            </Text>

            <Checkbox
              onChange={() => this.toggleExpandAll(aggregatedRows)}
              checked={expandAll}
              style={{ marginLeft: 20 }}
            >
              Expand All
            </Checkbox>
            <Checkbox
              onChange={() => this.toggleShowMacEventsOnly()}
              checked={showMacEventsOnly}
              style={{ marginLeft: 20 }}
            >
              Filter Events w/ Commands
            </Checkbox>
            <Text
              strong
              style={{
                marginLeft: 20,
                fontSize: 13,
                color: "rgba(0, 0, 0, 0.85)",
              }}
            >
              Show Dropped Uplinks:
            </Text>
            <Checkbox
              onChange={() => this.toggleShowLate()}
              checked={showLate}
              style={{ marginLeft: 10 }}
            >
              Late
            </Checkbox>
            <Checkbox
              onChange={() => this.toggleShowInactive()}
              checked={showInactive}
              style={{ marginLeft: 4 }}
            >
              Inactive Device
            </Checkbox>
          </span>
          {
            !this.props.mobile && (
              <Button
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_EXPORT_DEVICE_EVENTS_LOG", {
                    device_id: this.props.device_id,
                  });
                  this.props.getAllEvents(this.props.device_id).then((events) => {
                    const json = JSON.stringify(events, null, 2);
                    const blob = new Blob([json], { type: "application/json" });
                    const href = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = href;
                    link.download = "event-debug.json";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  });
                }}
                size="small"
              >
                Export JSON
              </Button>
            )
          }
        </div>
        <div id="event-log" ref={this.listRef}>
          <Table
            dataSource={aggregatedRows}
            columns={columns}
            rowKey={(record) => record.id}
            pagination={false}
            expandedRowRender={this.renderExpandedTabs}
            expandedRowKeys={expandedRowKeys}
            onExpand={this.onExpandRow}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getAllEvents }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(EventsDashboard, DEVICE_EVENTS, (props) => ({
    fetchPolicy: "network-only",
    variables: { device_id: props.device_id },
    name: "deviceEventsQuery",
  }))
);
