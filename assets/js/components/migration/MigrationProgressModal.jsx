import React, { useState } from "react";
import { Modal, Button, Typography, Progress } from "antd";
import { createDevice } from '../../actions/migration'
const { Text } = Typography;

export default ({ open, close, rows, apiKey, tenantId, applicationId }) => {
  const [status, setStatus] = useState("initial")
  const [count, setCount] = useState({ success: 0, failure: 0 })

  const allDevicesHaveRegions = rows.every(r => !!r.region)

  const startMigration = async () => {
    setStatus("started")
    setCount({ success: 0, failure: 0 })

    for (const r of rows) {
      try {
          const data = await createDevice(r.id, apiKey, applicationId, tenantId, r.region, r.devaddr, r.nwk_s_key, r.app_s_key, r.migration_status)
          setCount(c => ({ ...c, success: c.success + 1 }))
      } catch (error) {
          setCount(c => ({ ...c, failure: c.failure + 1 }))
      }
    }

    setStatus("complete")
  }

  const getTitle = () => {
    if (status == "initial") return "Are you sure you want to migrate?"
    if (status == "started") return "Migration is in progress"

    if (count.failure == 0) return "Migration complete"
    return "Partial migration complete"
  }

  const generateFooter = () => {
    if (status == "initial")
      return [
        <Button key="back" onClick={() => {
          setCount({ success: 0, failure: 0 })
          setStatus("initial")
          close()
        }}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={startMigration} disabled={!allDevicesHaveRegions}>
          OK
        </Button>,
      ]
    if (status == "started") return []
      return [
        <Button key="submit" type="primary" onClick={() => {
          setCount({ success: 0, failure: 0 })
          setStatus("initial")
          close()
        }}>
          OK
        </Button>,
      ]
  }

  return (
    <Modal
      title={getTitle()}
      visible={open}
      onCancel={() => {
        if (status !== "started") {
          setCount({ success: 0, failure: 0 })
          setStatus("initial")
          close()
        }
      }}
      centered
      onOk={startMigration}
      footer={generateFooter()}
    >
      <div style={{ textAlign: "center" }}>
        {
          status == "initial" && rows.length && (
            <Text>
              {
                allDevicesHaveRegions ? (
                  `You've requested to migrate ${rows.length} devices. Please press OK to proceed.`
                ) : (
                  "All selected devices must have a region selected to continue."
                )
              }
            </Text>
          )
        }
        {
          status == "started" && (
            <div>
              <Text>
                Please wait a moment...
              </Text>
              <Progress percent={Math.floor((count.success + count.failure) / rows.length * 100)} />
            </div>
          )
        }
        {
          status == "complete" && (
            <div>
              {
                count.success == rows.length ? (
                  <Text>
                    All {rows.length} devices were migrated successfully. Click OK to select more devices to migrate.
                  </Text>
                ) : (
                  <Text>
                    {count.success} of your {rows.length} devices were migrated successfully. Click OK to select more devices to migrate and retry devices.
                  </Text>
                )
              }
            </div>
          )
        }
      </div>
    </Modal>
  );
};
