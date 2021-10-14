import React from "react";
import { Link } from "react-router-dom";
import { Tag, Tooltip, Button } from "antd";
import Icon from "@ant-design/icons/lib/components/Icon";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import startCase from "lodash/startCase";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";
import SignalIcon from "./SignalIcon";

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
  updateOrganizationHotspot,
  selectHotspotAddress,
  fromSearch = false
) => {
  const columns = [
    {
      width: "30px",
      render: (data, record) => {
        const hotspot_claimed =
          props.orgHotspotsMap &&
          props.orgHotspotsMap[record.hotspot_address] &&
          props.orgHotspotsMap[record.hotspot_address].claimed;

        return (
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              updateOrganizationHotspot(
                record.hotspot_address,
                !hotspot_claimed
              );
            }}
          >
            <img
              draggable="false"
              src={hotspot_claimed ? SelectedFlag : UnselectedFlag}
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

  if (fromSearch) return columns.filter((c) => c.dataIndex !== "alias");
  return columns;
};

export const ClaimButton = ({ onClick }) => (
  <Button style={{ borderRadius: 4 }} onClick={onClick}>
    <img
      draggable="false"
      src={SelectedFlag}
      style={{
        height: 18,
        marginRight: 10,
      }}
    />
    Claim Selected Hotspots
  </Button>
);

export const UnclaimButton = ({ onClick }) => (
  <Button style={{ borderRadius: 4 }} onClick={onClick}>
    <img
      draggable="false"
      src={UnselectedFlag}
      style={{
        height: 18,
        marginRight: 10,
      }}
    />
    Unclaim Selected Hotspots
  </Button>
);
