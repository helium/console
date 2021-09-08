import React, { useState } from "react";
import moment from "moment";
import { useQuery } from "@apollo/client";
import { HOTSPOT_SHOW_DEVICES_HEARD } from "../../graphql/coverage";
import { minWidth } from "../../util/constants";
import { Typography, Table, Pagination } from "antd";
import { Link } from "react-router-dom";
const { Text } = Typography;

const columns = [
  {
    title: "Device Name",
    sorter: true,
    dataIndex: "device_name",
    render: (data, record) => (
      <Link
        to={`/devices/${record.device_id}`}
      >
        {data}
      </Link>
    )
  },
  {
    title: "Packets Relayed",
    sorter: true,
    dataIndex: "packet_count",
  },
  {
    title: "Average RSSI",
    sorter: true,
    dataIndex: "rssi",
    render: data => data.toFixed(2)
  },
  {
    title: "Average SNR",
    sorter: true,
    dataIndex: "snr",
    render: data => data.toFixed(2)
  },
  {
    title: "Last Heard",
    sorter: true,
    dataIndex: "reported_at",
    render: (data) => moment.utc(data).local().format("lll"),
  },
];

export default (props) => {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [column, setColumn] = useState("packet_count");
  const [order, setOrder] = useState("desc");

  const {
    loading: devicesHeardLoading,
    error: devicesHeardError,
    data: devicesHeardData,
    refetch: devicesHeardRefetch,
  } = useQuery(HOTSPOT_SHOW_DEVICES_HEARD, {
    fetchPolicy: "cache-and-network",
    variables: {
      address: props.hotspot.hotspot_address,
      column,
      order,
      page,
      pageSize
    }
  });

  const handleSort = (pagi, filter, sorter) => {
    const order = sorter.order === 'ascend' ? 'asc' : 'desc'
    let column
    switch (sorter.field) {
      case 'device_name':
        column = 'device_name'
        break;
      case 'packet_count':
        column = 'packet_count'
        break;
      case 'reported_at':
        column = 'reported_at'
        break;
      default:
        column = 'packet_count'
    }

    devicesHeardRefetch({
      address: props.hotspot.hotspot_address,
      page,
      pageSize,
      column,
      order
    });

    setOrder(order)
    setColumn(column)
  }

  const handleChangePage = (page) => {
    setPage(page);
    devicesHeardRefetch({
      address: props.hotspot.hotspot_address,
      page,
      pageSize,
      column,
      order
    });
  };

  return (
    <div
      style={{ overflowX: "scroll", overflowY: "hidden" }}
      className="no-scroll-bar"
    >
      <Table
        sortDirections={['descend', 'ascend', 'descend']}
        showSorterTooltip={false}
        dataSource={devicesHeardData ? devicesHeardData.hotspotDevicesHeard : []}
        columns={columns}
        rowKey={(record) => record.device_id}
        pagination={false}
        style={{ overflowY: "hidden" }}
        className="no-scroll-bar"
        onChange={handleSort}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 0,
        }}
      >
        <Pagination
          current={page}
          pageSize={pageSize}
          total={
            devicesHeardData && devicesHeardData.hotspotDevicesHeard.length > 0 ?
            devicesHeardData.hotspotDevicesHeard[0].total_entries : 0
          }
          onChange={(page) => handleChangePage(page)}
          style={{ marginBottom: 20 }}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};
