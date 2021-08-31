import React from "react";
import moment from "moment";
import { useQuery } from "@apollo/client";
import { HOTSPOT_SHOW_DEVICES_HEARD } from "../../graphql/coverage";
import { minWidth } from "../../util/constants";
import { Typography, Table } from "antd";
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
    title: "Last Heard",
    sorter: true,
    dataIndex: "reported_at",
    render: (data) => moment.utc(data).local().format("lll"),
  },
];

export default (props) => {
  const {
    loading: devicesHeardLoading,
    error: devicesHeardError,
    data: devicesHeardData,
    refetch: devicesHeardRefetch,
  } = useQuery(HOTSPOT_SHOW_DEVICES_HEARD, {
    fetchPolicy: "cache-and-network",
    variables: { address: props.hotspot.hotspot_address }
  });

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
        style={{ minWidth, overflowY: "hidden" }}
      />
    </div>
  );
};
