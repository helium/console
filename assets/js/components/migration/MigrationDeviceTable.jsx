import React from "react";
import { Link } from "react-router-dom";
import { Typography, Input, Select, Button, Table, Pagination, Popover } from "antd"
import { ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
const { Text } = Typography;
const { Option } = Select;
import { primaryBlue } from "../../util/colors";
import UserCan, { userCan } from "../common/UserCan";

const regions = ["EU868", "US915", "AS923", "AS923_2", "AS923_3", "AS923_4", "CN470", "CN779", "AU915", "IN865", "KR920", "RU864"]

const columns = [
  {
    title: "Device Name",
    dataIndex: "name"
  },
  {
    title: "Device EUI",
    dataIndex: "dev_eui",
  },
  {
    title: () => {
      return (
        <div>
          Region
          <Popover
            content="Please select a region for the device or the device will not work on 1663 Console."
            placement="bottom"
            overlayStyle={{ width: 250 }}
          >
            <QuestionCircleOutlined style={{ fontSize: 12, marginLeft: 5 }} />
          </Popover>
        </div>
      )
    },
    dataIndex: "Region"
  },
  {
    title: () => {
      return (
        <div>
          Live Migratable
          <Popover
            content="Devices that are Live Migratable do not require a reset. If your device is not Live Migratable, please rejoin it manually to complete the migration to 1663 Console. Note: You can migrate it to 1663 Console first, then rejoin it."
            placement="bottom"
            overlayStyle={{ width: 350 }}
          >
            <QuestionCircleOutlined style={{ fontSize: 12, marginLeft: 5 }} />
          </Popover>
        </div>
      )
    },
    dataIndex: "Live Migratable",
  },
  {
    title: "Migration Status",
    dataIndex: "Migration Status",
  }
]

const MigrationDeviceTable = ({ updateShowStep }) => {
  const rowSelection = {
    onChange: (keys, selectedRows) => {},
    onSelectAll: () => {},
  };

  return (
    <>
      <div
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
        }}
      >
        <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: "20px 20px 20px 30px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 600 }}>Select Devices to Migrate</Text>
              <Button type="primary" icon={<ReloadOutlined />} shape="circle" style={{ marginLeft: 10 }} size="small" />
            </div>
            <UserCan>
              <div style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                <Select
                  placeholder="Filter devices"
                  style={{ width: 180, marginRight: 10 }}
                  onSelect={() => {}}
                >
                  <Option value="Unknown Region">
                    Unknown Region
                  </Option>
                  <Option value="Live Migratable">
                    Live Migratable
                  </Option>
                </Select>

                <Select
                  placeholder="Set Regions to..."
                  style={{ width: 180, marginRight: 10 }}
                  onSelect={() => {}}
                >
                  {
                    regions.map(r => (
                      <Option key={r} value={r}>
                        {r}
                      </Option>
                    ))
                  }
                </Select>
              </div>
            </UserCan>
          </div>
        </div>

        <>
          <Table
            showSorterTooltip={false}
            sortDirections={['descend', 'ascend', 'descend']}
            columns={columns}
            dataSource={[]}
            rowKey={(record) => record.id}
            pagination={false}
            rowSelection={rowSelection}
            onChange={() => {}}
            style={{ overflowX: "scroll", overflowY: "hidden" }}
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
            <Select
              value={'100 results'}
              onSelect={() => {}}
              style={{ marginRight: 40, paddingTop: 2 }}
            >
              <Option value={10}>10</Option>
              <Option value={25}>25</Option>
              <Option value={100}>100</Option>
              <Option value={250}>250</Option>
            </Select>
            <Pagination
              current={0}
              pageSize={100}
              total={1000}
              onChange={() => {}}
              style={{ marginBottom: 20 }}
              showSizeChanger={false}
            />
          </div>
        </>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "20px 20px 20px 20px",
          height: "100%",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            style={{ marginLeft: 10 }}
            type="primary"
            onClick={() => updateShowStep(1)}
          >
            Back
          </Button>
          <UserCan>
            <Button
              style={{ marginLeft: 10 }}
              type="primary"
              disabled={true}
              onClick={() => {}}
            >
              Next: Start Device Migration
            </Button>
          </UserCan>
        </div>
      </div>
    </>
  )
}

export default MigrationDeviceTable
