import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import { Table, Typography, Row, Col } from "antd";
import Icon from '@ant-design/icons/lib/components/Icon';
import startCase from 'lodash/startCase'
import { minWidth } from "../../util/constants";
const { Text } = Typography;
import SelectedFlag from "../../../img/coverage/selected-flag.svg";

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

export default (props) => {
  const columns = [
    {
      title: "Hotspot Name",
      dataIndex: "hotspot_name",
      render: (data) => startCase(data),
    },
    {
      title: "Location",
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
      dataIndex: "packet_count",
    },
    {
      title: "# of Devices",
      dataIndex: "device_count",
    },
    {
      title: "Status",
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
                > # devices </Link>
                over the past 30 days.
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

      <div>
        {
          props.hotspotStats && (
            <Table
              dataSource={props.hotspotStats}
              columns={columns}
              rowKey={(record) => record.hotspot_address}
              pagination={false}
              className="no-scroll-bar"
              style={{ minWidth, overflowX: "scroll", overflowY: "hidden" }}
            />
          )
        }
      </div>
    </div>
  );
};
