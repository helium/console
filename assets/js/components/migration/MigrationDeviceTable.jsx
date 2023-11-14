import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { displayError } from '../../util/messages'
import { getDevices } from '../../actions/migration'
import { Link } from "react-router-dom";
import { Typography, Input, Select, Button, Table, Pagination, Popover } from "antd"
import { ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
const { Text } = Typography;
const { Option } = Select;
import { primaryBlue } from "../../util/colors";
import UserCan, { userCan } from "../common/UserCan";
import find from 'lodash/find'

const regions = ["EU868", "US915", "AS923", "AS923_2", "AS923_3", "AS923_4", "CN470", "CN779", "AU915", "IN865", "KR920", "RU864"]

const MigrationDeviceTable = ({ updateShowStep, label, apiKey, tenantId }) => {
  const mountedRef = useRef(true)
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState([])
  const [visibleDevices, setVisibleDevices] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [filter, setFilter] = useState("")
  const [selectedRows, setSelectedRows] = useState([])
  const [allSelected, setAllSelected] = useState(false)

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
      dataIndex: "region",
      render: (text, record) => (
        <Select
          placeholder="Unknown"
          style={{ width: 180, marginRight: 10 }}
          onSelect={(region) => {
            const updatedDevices = devices.map(d => {
              if (d.id == record.id) return Object.assign({}, d, { region })
              return d
            })

            setDevices(updatedDevices)
          }}
          value={record.region}
          status={record.region ? undefined : "error"}
        >
          {
            regions.map(r => (
              <Option key={r} value={r}>
                {r}
              </Option>
            ))
          }
        </Select>
      )
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
      dataIndex: "live_migratable",
      render: (text, record) => (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <div
            style={{
              display: "inline-block",
              height: "6px",
              width: "6px",
              borderRadius: "50px",
              marginRight: "4px",
              backgroundColor: record.live_migratable ? '#52c41a' : '#F5222D'
            }}
          />
          <Text>{record.live_migratable ? "Yes" : "No"}</Text>
        </div>
      )
    },
    {
      title: "Migration Status",
      dataIndex: "migration_status",
      render: (_text, record) => {
        let text = record.migration_status ? "Migrated" : "Ready to Migrate"
        let color = record.migration_status ? '#52c41a' : '#38A2FF'
        if (!record.region && !record.migration_status) {
          text = "No Region Selected"
          color = '#F5222D'
        }

        return (
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div
              style={{
                display: "inline-block",
                height: "6px",
                width: "6px",
                borderRadius: "50px",
                marginRight: "4px",
                backgroundColor: color
              }}
            />
            <Text>{text}</Text>
          </div>
        )
      }
    }
  ]

  const rowSelection = useMemo(() => {
    return {
      onChange: (keys, selectedRows) => {
        setSelectedRows(selectedRows)
      },
      onSelectAll: () => {
        setAllSelected(state => !state)
      }
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const data = await getDevices(label, apiKey, tenantId)
    if (mountedRef.current) {
      setDevices(data)
      setLoading(false)
    }
  }, [label])

  const getPaginationTotal = useCallback(() => {
    if (filter == "unknown_region") {
      return devices.filter(d => !d.region).length
    } else if (filter == "not_live_migratable") {
      return devices.filter(d => d.live_migratable).length
    } else if (filter == "not_migrated") {
      return devices.filter(d => !d.migration_status).length
    } else {
      return devices.length
    }
  }, [filter, devices])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // only refetch when devices get cleared or when empty from mount
    if (devices.length == 0) {
      fetchData()
        .catch(err => {
          displayError("Could not fetch devices from label.")
          setLoading(false)
        })
    }
  }, [fetchData, devices])

  useEffect(() => {
    if (devices.length > 0) {
      if (filter == "unknown_region") {
        setVisibleDevices(
          devices
          .filter(d => !d.region)
          .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
        )
      } else if (filter == "not_live_migratable") {
        setVisibleDevices(
          devices
          .filter(d => d.live_migratable)
          .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
        )
      } else if (filter == "not_migrated") {
        setVisibleDevices(
          devices
          .filter(d => !d.migration_status)
          .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
        )
      } else {
        setVisibleDevices(devices.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize))
      }
    }
  }, [page, pageSize, devices, filter])

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
              <Text style={{ fontSize: 16, fontWeight: 600 }}>{loading ? "Please wait while we load your devices..." : "Select Devices to Migrate"}</Text>
              {
                !loading && (
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    shape="circle"
                    style={{ marginLeft: 10 }}
                    size="small"
                    onClick={() => {
                      setFilter("")
                      setDevices([])
                      setVisibleDevices([])
                    }}
                  />
                )
              }
            </div>
            <UserCan>
              <div style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                <Select
                  placeholder="Filter devices"
                  style={{ width: 180, marginRight: 10 }}
                  onSelect={(val) => {
                    setFilter(val)
                    setPage(1)
                  }}
                  value={filter}
                >
                  <Option value="unknown_region">
                    Unknown Region
                  </Option>
                  <Option value="not_live_migratable">
                    Live Migratable
                  </Option>
                  <Option value="not_migrated">
                    Not Migrated
                  </Option>
                  <Option value="">
                    No Filter
                  </Option>
                </Select>

                <Select
                  placeholder="Set Regions to..."
                  style={{ width: 180, marginRight: 10 }}
                  onSelect={(region) => {
                    const selectedIds = {}
                    selectedRows.forEach(r => selectedIds[r.id] = true)

                    const updatedDevices = devices.map(d => {
                      if (selectedIds[d.id]) return Object.assign({}, d, { region })
                      return d
                    })

                    setDevices(updatedDevices)
                  }}
                  value={null}
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
            dataSource={visibleDevices}
            rowKey={(record) => record.id}
            pagination={false}
            rowSelection={rowSelection}
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
              value={pageSize}
              onSelect={(ps) => {
                setPageSize(ps)
                setPage(1)
              }}
              style={{ marginRight: 40, paddingTop: 2 }}
            >
              <Option value={25}>25</Option>
              <Option value={100}>100</Option>
              <Option value={500}>500</Option>
            </Select>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={getPaginationTotal()}
              onChange={(p) => setPage(p)}
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
              disabled={selectedRows.length == 0}
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
