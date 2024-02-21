import React from "react";
import { Link } from "react-router-dom";
import { Typography, Input, Select, Button, Radio } from "antd"
const { Text } = Typography;
import { primaryBlue } from "../../util/colors";

const MigrationSelectLabel = ({ instanceRegion, apiKey, tenantId, application, label, allLabels, allApplications, handleUpdate, handleInstanceUpdate, handleSelect, updateShowStep, fetchApplications }) => {
  return (
    <div
      style={{
        padding: "30px 30px 30px 30px",
        height: "100%",
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
      }}
    >
      <div>
        <Text>Welcome to the 1663 Console Migration Tool. Use this tool to migrate your devices from Helium Console to 1663 Console.</Text>
      </div>

      <div style={{ marginTop: 8 }}>
        <Text>
          For detailed tutorials, please consult our
          <Link to={{ pathname: "https://1663.gitbook.io/1663-console/migration-guide/migrate-your-devices"}}target="_blank" onClick={e => e.preventDefault()}>
            <Text style={{
              marginBottom: 0,
              color: primaryBlue,
            }}> support documentation.</Text>
          </Link>
        </Text>
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div style={{ width: 600 }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 150, display: "flex", justifyContent: 'flex-end' }}>
            <Text>V2 Instance: </Text>
          </div>
          <Radio.Group style={{ marginLeft: 10 }} onChange={handleInstanceUpdate} value={instanceRegion} name="instanceRegion">
            <Radio value={"US"}>US</Radio>
            <Radio value={"EU"}>EU</Radio>
          </Radio.Group>
        </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
            <div style={{ width: 150, display: "flex", justifyContent: 'flex-end' }}>
              <Text>V2 API Key: </Text>
            </div>
            <Input
              name="apiKey"
              style={{ width: 350, marginLeft: 10 }}
              placeholder="E.g. biubcuiwfvwu98T97Tg8ygi"
              onChange={handleUpdate}
              value={apiKey}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 150, display: "flex", justifyContent: 'flex-end' }} />
            <Text style={{ marginLeft: 10 }}>Please paste the API key you created in 1663 Console V2</Text>
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 150, display: "flex", justifyContent: 'flex-end' }}>
              <Text>Tenant ID: </Text>
            </div>
            <Input
              name="tenantId"
              style={{ width: 350, marginLeft: 10 }}
              placeholder="Please enter your tenant-id"
              onChange={handleUpdate}
              value={tenantId}
            />
            <Button
              style={{ marginLeft: 10 }}
              type="primary"
              disabled={!instanceRegion || !apiKey || !tenantId}
              onClick={() => fetchApplications(apiKey, tenantId, instanceRegion)}
            >
              Fetch
            </Button>
          </div>
          { allApplications.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: 20 }}>
                <div style={{ width: 150, display: "flex", justifyContent: 'flex-end' }}>
                  <Text>Application: </Text>
                </div>
                <Select
                  value={application}
                  placeholder="Select an application"
                  style={{ width: 200, marginLeft: 10 }}
                  onChange={val => handleSelect("application", val)}
                  options={allApplications.map(a => {
                    return { value: a.id, label: a.name }
                  })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: 20 }}>
                <div style={{ width: 150, display: "flex", justifyContent: 'flex-end' }}>
                  <Text>Label: </Text>
                </div>
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.label ?? '').includes(input)}
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                  }
                  name="label"
                  value={label}
                  placeholder="Search a Label"
                  style={{ width: 200, marginLeft: 10 }}
                  onChange={val => handleSelect("label", val)}
                  options={allLabels.map(l => {
                    return { value: l.id, label: l.name }
                  })}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                <div style={{ width: 150, display: "flex", justifyContent: 'flex-end' }} />
                <Button
                  style={{ marginLeft: 10 }}
                  type="primary"
                  disabled={!application || !label}
                  onClick={() => updateShowStep(2)}
                >
                  Next: Select Devices to Migrate
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MigrationSelectLabel
