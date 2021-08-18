import React from "react";
import { Link } from 'react-router-dom';
import Icon from '@ant-design/icons/lib/components/Icon';
import startCase from 'lodash/startCase'
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";

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

export const getColumns = (props, updateOrganizationHotspot) => {
  return [
    {
      width: '30px',
      render: (data, record) => {
        const hotspot_claimed = props.orgHotspotsMap[record.hotspot_address]

        return (
          <Link to="#" onClick={() => updateOrganizationHotspot(record.hotspot_address, !hotspot_claimed)}>
            <img
              draggable="false"
              src={hotspot_claimed ? SelectedFlag : UnselectedFlag}
              style={{
                height: 14,
              }}
            />
          </Link>
        )
      }
    },
    {
      title: "Hotspot Name",
      sorter: true,
      dataIndex: "hotspot_name",
      render: (data) => startCase(data)
    },
    {
      title: "Location",
      sorter: true,
      dataIndex: "location",
      render: (data, record) => {
        if (record.long_city && record.short_country && record.short_state) {
          return record.long_city + ", " + record.short_state + ", " + record.short_country
        }
        if (!record.long_city && record.short_country) {
          return record.short_country
        }
        return ""
      }
    },
    {
      title: "Packets",
      sorter: true,
      render: (data, record) => {
        const positive = record.packet_count - record.packet_count_2d >= 0
        return (
          <span>
            {`${record.packet_count} `}
            <span style={{ fontSize: 14, color: positive ? '#12CB9E' : '#F15B47', marginLeft: 8 }}>
              {record.packet_count_2d != 0 && `${positive ? "+" : ""}${((record.packet_count - record.packet_count_2d) / record.packet_count_2d * 100).toFixed(2)}%`}
            </span>
          </span>
        )
      }
    },
    {
      title: "# of Devices",
      sorter: true,
      render: (data, record) => {
        const positive = record.device_count - record.device_count_2d >= 0
        return (
          <span>
            {`${record.device_count} `}
            <span style={{ fontSize: 14, color: positive ? '#12CB9E' : '#F15B47', marginLeft: 8 }}>
              {record.packet_count_2d != 0 && `${positive ? "+" : ""}${((record.device_count - record.device_count_2d) / record.device_count_2d * 100).toFixed(2)}%`}
            </span>
          </span>
        )
      }
    },
    {
      title: "Status",
      sorter: true,
      dataIndex: "status",
      render: (data) => {
        let svg
        switch (data) {
          case "online":
            svg = GreenStatusSvg
            break;
          case "offline":
            svg = RedStatusSvg
            break;
          default:
            svg = OrangeStatusSvg
            break;
        }
        return (
          <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Icon component={svg} style={{ marginRight: 4 }} />
            {startCase(data)}
          </span>
        )
      }
    },
  ];
}
