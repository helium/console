import React, { useEffect } from "react";
import { Typography, Row, Col, Table } from "antd";
const { Text } = Typography;
import { updateOrganizationHotspot } from '../../actions/coverage'
import { getColumns } from './Constants'
import { minWidth } from "../../util/constants";
import HeaderFlag from "../../../img/coverage/followed-tab-header-flag.svg";

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
                props.hotspotStats.filter(hs => props.orgHotspotsMap[hs.hotspot_address] && props.orgHotspotsMap[hs.hotspot_address].claimed)
              }
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
