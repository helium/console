import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import { Table, Typography, Row, Col } from "antd";
import { minWidth } from "../../util/constants";
import { updateOrganizationHotspot } from '../../actions/coverage'
import { getColumns } from './Constants'
const { Text } = Typography;
import SelectedFlag from "../../../img/coverage/selected-flag.svg";

export default (props) => {
  const columns = getColumns(props, updateOrganizationHotspot, props.selectHotspotAddress)

  const handleSort = (pagi, filter, sorter) => {
    const order = sorter.order === 'ascend' ? 'asc' : 'desc'
    let column
    switch (sorter.field) {
      case 'hotspot_name':
        column = 'hotspot_name'
        break;
      case 'location':
        column = 'long_city'
        break;
      case 'packet_count':
        column = 'packet_count'
        break;
      case 'device_count':
        column = 'device_count'
        break;
      case 'status':
        column = 'status'
        break;
      default:
        column = 'packet_count'
    }

    props.refetch({ column, order })
  }

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
                The hotspots listed below provided coverage for
                {props.deviceCount ? ` ${props.deviceCount.count_1d} ` : " none "}
                of your
                <Link
                  to={"/devices"}
                  className="help-link"
                  style={{ fontSize: 15 }}
                > devices </Link>
                over the past 24 hours.
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
              style={{ overflowY: "hidden" }}
              className="no-scroll-bar"
              onChange={handleSort}
            />
          )
        }
      </div>
    </div>
  );
};
