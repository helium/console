import React from "react";
import { Link } from "react-router-dom";
import { Tooltip, Button, Dropdown, Menu } from "antd";
import Icon from "@ant-design/icons/lib/components/Icon";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import startCase from "lodash/startCase";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";
import PreferredFlag from "../../../img/coverage/preferred-flag.svg";
import SignalIcon from "./SignalIcon";
import GroupColumnDropdown from "./GroupColumnDropdown";
import DownOutlined from "@ant-design/icons/DownOutlined";
import { followHotspots, preferHotspots } from "../../actions/coverage";

const RedStatusSvg = () => (
  <svg height="11" width="10">
    <circle cx="5" cy="5" r="5" fill="#E06550" />
  </svg>
);

const GreenStatusSvg = () => (
  <svg height="11" width="10">
    <circle cx="5" cy="5" r="5" fill="#70DC6D" />
  </svg>
);

const OrangeStatusSvg = () => (
  <svg height="11" width="10">
    <circle cx="5" cy="5" r="5" fill="#E39355" />
  </svg>
);

export const renderStatusLabel = (status) => {
  let svg;
  switch (status) {
    case "online":
      svg = GreenStatusSvg;
      break;
    case "offline":
      svg = RedStatusSvg;
      break;
    default:
      svg = OrangeStatusSvg;
      break;
  }
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F6FC",
        borderRadius: 20,
        padding: "2px 6px 2px 6px",
      }}
    >
      <Icon component={svg} style={{ marginRight: 6 }} />
      {status ? startCase(status) : "Unknown"}
    </span>
  );
};

export const getColumns = (
  props,
  followHotspot,
  preferHotspot,
  selectHotspotAddress,
  tab,
  warnUnfollow
) => {
  const columns = [
    {
      width: "30px",
      render: (data, record) => {
        const hotspot_claimed =
          props.orgHotspotsMap &&
          props.orgHotspotsMap[record.hotspot_address] &&
          props.orgHotspotsMap[record.hotspot_address].claimed;

        const hotspot_preferred =
          hotspot_claimed &&
          props.orgHotspotsMap[record.hotspot_address].preferred;

        return (
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              if (hotspot_claimed && !hotspot_preferred) {
                preferHotspot(record.hotspot_address, true);
              } else {
                if (
                  warnUnfollow &&
                  hotspot_preferred &&
                  props.preferredHotspotAddresses.length > 0 &&
                  props.preferredHotspotAddresses.filter(
                    (pha) => pha !== record.hotspot_address
                  ).length === 0
                ) {
                  warnUnfollow([record.hotspot_address]);
                } else {
                  followHotspot(record.hotspot_address, !hotspot_claimed);
                }
              }
            }}
          >
            <img
              draggable="false"
              src={
                hotspot_claimed
                  ? hotspot_preferred
                    ? PreferredFlag
                    : SelectedFlag
                  : UnselectedFlag
              }
              style={{
                height: 14,
              }}
            />
          </Link>
        );
      },
    },
    {
      title: "Hotspot Name",
      sorter: true,
      dataIndex: "hotspot_name",
      render: (data, record) => {
        if (data) {
          return (
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                selectHotspotAddress(record.hotspot_address);
              }}
            >
              {startCase(data)}
            </Link>
          );
        }
        return (
          <span>
            <span>Unknown Hotspot</span>
            <Tooltip
              title={
                "Hotspot data is currently unavailable. Please wait for next API sync."
              }
            >
              <InfoCircleOutlined style={{ marginLeft: 6 }} />
            </Tooltip>
          </span>
        );
      },
    },
    {
      title: "Alias",
      sorter: true,
      dataIndex: "alias",
    },
    {
      title: "Signal",
      dataIndex: "avg_rssi",
      sorter: true,
      render: (data) => <SignalIcon rssi={data} />,
    },
    {
      title: "Packets",
      sorter: true,
      dataIndex: "packet_count",
      render: (data, record) => {
        const positive = record.packet_count - record.packet_count_2d >= 0;
        return (
          <span>
            {`${record.packet_count} `}
            <span
              style={{
                fontSize: 14,
                color: positive ? "#12CB9E" : "#F15B47",
                marginLeft: 8,
              }}
            >
              {record.packet_count_2d !== 0 &&
                `${positive ? "+" : ""}${(
                  ((record.packet_count - record.packet_count_2d) /
                    record.packet_count_2d) *
                  100
                ).toFixed(2)}%`}
            </span>
          </span>
        );
      },
    },
    {
      title: "# of Devices",
      sorter: true,
      dataIndex: "device_count",
      render: (data, record) => {
        const positive = record.device_count - record.device_count_2d >= 0;
        return (
          <span>
            {`${record.device_count} `}
            <span
              style={{
                fontSize: 14,
                color: positive ? "#12CB9E" : "#F15B47",
                marginLeft: 8,
              }}
            >
              {record.packet_count_2d !== 0 &&
                `${positive ? "+" : ""}${(
                  ((record.device_count - record.device_count_2d) /
                    record.device_count_2d) *
                  100
                ).toFixed(2)}%`}
            </span>
          </span>
        );
      },
    },
    {
      title: "Groups",
      sorter: false,
      dataIndex: "group_ids",
      render: (data, record) => {
        return (
          <GroupColumnDropdown
            appliedGroups={data ? data.split(",") : []}
            hotspotId={record.id}
            allGroups={props.allGroups}
          />
        );
      },
    },
    {
      title: "Status",
      sorter: true,
      dataIndex: "status",
      render: (data) => {
        let svg;
        switch (data) {
          case "online":
            svg = GreenStatusSvg;
            break;
          case "offline":
            svg = RedStatusSvg;
            break;
          default:
            svg = OrangeStatusSvg;
            break;
        }
        return (
          <span
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Icon component={svg} style={{ marginRight: 4 }} />
            {data ? startCase(data) : "Unknown"}
          </span>
        );
      },
    },
  ];

  switch (tab) {
    case "search":
      return columns.filter(
        (c) =>
          c.dataIndex !== "alias" &&
          c.dataIndex !== "group_ids" &&
          c.dataIndex !== "avg_rssi" &&
          c.dataIndex !== "packet_count" &&
          c.dataIndex !== "device_count"
      );
    case "main":
      return columns.filter((c) => c.dataIndex !== "group_ids");
    default:
      return columns;
  }
};

export const ActionButton = ({
  selectedAddresses,
  warnUnfollow,
  preferredHotspotAddresses,
}) => {
  const menu = () => (
    <Menu
      onClick={(e) => {
        if (e.key === "follow") {
          followHotspots(selectedAddresses, true);
        } else if (e.key === "prefer") {
          preferHotspots(selectedAddresses, true);
        } else {
          if (
            warnUnfollow &&
            preferredHotspotAddresses.length > 0 &&
            preferredHotspotAddresses.filter(
              (pha) => !selectedAddresses.includes(pha)
            ).length === 0
          ) {
            warnUnfollow(selectedAddresses);
          } else {
            followHotspots(selectedAddresses, false);
          }
        }
      }}
    >
      <Menu.Item key="follow">
        <img
          draggable="false"
          src={SelectedFlag}
          style={{
            height: 14,
            marginRight: 5,
          }}
        />
        Followed Hotspot
      </Menu.Item>
      <Menu.Item key="prefer">
        <img
          draggable="false"
          src={PreferredFlag}
          style={{
            height: 14,
            marginRight: 5,
          }}
        />
        Preferred Hotspot
      </Menu.Item>
      <Menu.Item key="unfollow">
        <img
          draggable="false"
          src={UnselectedFlag}
          style={{
            height: 14,
            marginRight: 5,
          }}
        />
        Unfollowed Hotspot
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu}>
      <Button style={{ borderRadius: 6, color: "#C6C6C6" }}>
        Mark Selected As <DownOutlined />
      </Button>
    </Dropdown>
  );
};
