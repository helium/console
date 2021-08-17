import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import { Typography, Row, Col, Table } from "antd";
const { Text } = Typography;
import Icon from '@ant-design/icons/lib/components/Icon';
import { updateOrganizationHotspot } from '../../actions/coverage'
import startCase from 'lodash/startCase'
import { minWidth } from "../../util/constants";
import HeaderFlag from "../../../img/coverage/followed-tab-header-flag.svg";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";
import { RedStatusSvg, GreenStatusSvg, OrangeStatusSvg } from './CoverageMainTab'

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
      <div style={{ padding: 25, paddingTop: 8 }}>
        <img
          draggable="false"
          src={HeaderFlag}
          style={{
            height: 32,
            width: 32,
            marginBottom: 6
          }}
        />
        <div style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>My Hotspots</Text>
        </div>
        <Row gutter={24}>
          <Col sm={12}>
            <Text style={{ fontSize: 15 }}>
              Hotspots that have been 'claimed' appear in the list below.
            </Text>
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
              showSorterTooltip={false}
              sortDirections={['descend', 'ascend', 'descend']}
              dataSource={
                props.hotspotStats.filter(hs => props.orgHotspotsMap[hs.hotspot_address])
              }
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
