import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import { Table, Typography, Row, Col } from "antd";
import Icon from '@ant-design/icons/lib/components/Icon';
import startCase from 'lodash/startCase'
import { minWidth } from "../../util/constants";
import { updateOrganizationHotspot } from '../../actions/coverage'
const { Text } = Typography;
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";

export const RedStatusSvg = () => (
  <svg height="11" width="10">
    <circle cx="5" cy="5" r="5" fill="#E06550" />
  </svg>
);

export const GreenStatusSvg = () => (
  <svg height="11" width="10">
    <circle cx="5" cy="5" r="5" fill="#70DC6D" />
  </svg>
);

export const OrangeStatusSvg = () => (
  <svg height="11" width="10">
    <circle cx="5" cy="5" r="5" fill="#E39355" />
  </svg>
);

export default (props) => {
  const columns = [
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
      dataIndex: "packet_count",
    },
    {
      title: "# of Devices",
      sorter: true,
      dataIndex: "device_count",
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

  return (
    <div>
      <div style={{ padding: 25 }}>
        <div style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>Device Coverage</Text>
        </div>
        <Row gutter={24}>
          <Col sm={12}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 15 }}>
                The hotspots listed below provided coverage for your
                <Link
                  to={"/devices"}
                  className="help-link"
                  style={{ fontSize: 15 }}
                >{props.deviceCount ? " " + props.deviceCount.count : ""} devices </Link>
                over the past 2 days.
              </Text>
            </div>
            <div>
              <a className="help-link">
                Learn More
              </a>
            </div>
          </Col>
          <Col sm={12}>
            <div style={{ backgroundColor: '#F5F7F9', borderRadius: 10, padding: 16 }}>
              <div style={{ marginBottom: 4 }}>
                <img
                  draggable="false"
                  src={SelectedFlag}
                  style={{
                    height: 18,
                    marginRight: 10
                  }}
                />
                <Text
                  style={{ fontWeight: 400, fontSize: 16, color: '#2C79EE'}}
                >
                  Claim to Follow
                </Text>
              </div>
              <div>
                <Text
                  style={{ color: '#2C79EE'}}
                >
                  Claiming a Hotspot allows you to mark which Hotspots are owned by your Organization.
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div
        style={{ overflowX: "scroll", overflowY: "hidden" }}
        className="no-scroll-bar"
      >
        {
          props.hotspotStats && (
            <Table
              sortDirections={['descend', 'ascend', 'descend']}
              showSorterTooltip={false}
              dataSource={props.hotspotStats}
              columns={columns}
              rowKey={(record) => record.hotspot_address}
              pagination={false}
              style={{ minWidth, overflowY: "hidden" }}
            />
          )
        }
      </div>
    </div>
  );
};
