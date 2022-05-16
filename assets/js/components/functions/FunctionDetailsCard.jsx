import React from "react";
import { useSelector } from "react-redux";
import UserCan, { userCan } from "../common/UserCan";
import { Typography, Card, Button, Input, Select } from "antd";
import ClearOutlined from "@ant-design/icons/ClearOutlined";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
const { Text } = Typography;
const { Option } = Select;
import { functionTypes, functionFormats } from "../../util/functionInfo";

export default ({
  fxn,
  name,
  type,
  format,
  body,
  handleInputUpdate,
  handleSelectFunctionType,
  handleSelectFormat,
  clearInputs,
  handleSubmit,
  horizontal,
}) => {
  const currentRole = useSelector((state) => state.organization.currentRole);
  return (
    <Card title="Function Details">
      <Text>Update Function</Text>
      <div style={{ marginTop: 5 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Input
            name="name"
            value={name}
            onChange={handleInputUpdate}
            style={
              horizontal
                ? { width: 300, verticalAlign: "middle" }
                : { width: "100%", marginBottom: 11 }
            }
            suffix={`${name && name.length}/50`}
            maxLength={50}
            disabled={!userCan({ role: currentRole })}
          />
          <Select
            placeholder={functionTypes[fxn.type]}
            onSelect={handleSelectFunctionType}
            style={
              horizontal
                ? { width: 220, marginLeft: 8 }
                : { width: "100%", marginBottom: 7 }
            }
            value={type}
            disabled={!userCan({ role: currentRole })}
          >
            {Object.keys(functionTypes).map(key => {
              return <Option key={key} value={key}>{functionTypes[key]}</Option>
            })}
          </Select>
          <Select
            placeholder={functionFormats[fxn.format]}
            onSelect={handleSelectFormat}
            style={
              horizontal
                ? { width: 220, marginLeft: 8 }
                : { width: "100%", marginBottom: 7 }
            }
            value={format}
            disabled={!userCan({ role: currentRole })}
          >
            {Object.keys(functionFormats).map(key => {
              return <Option key={key} value={key}>{functionFormats[key]}</Option>
            })}
          </Select>
        </div>
        <UserCan>
          <Button icon={<ClearOutlined />} onClick={clearInputs}>
            Clear
          </Button>
        </UserCan>

        {horizontal ? (
          <div>
            <UserCan>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={handleSubmit}
                disabled={
                  !type ||
                  !format ||
                  !name ||
                  (format === "custom" && !body) ||
                  (name === fxn.name &&
                    type === fxn.type &&
                    format === fxn.format &&
                    ((format === "custom" && body === fxn.body) ||
                      format !== "custom"))
                }
                style={{ marginTop: 20 }}
              >
                Save Changes
              </Button>
            </UserCan>
          </div>
        ) : (
          <UserCan>
            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={handleSubmit}
              disabled={
                !type && !format && name.length === 0 && body.length === 0
              }
            >
              Save Changes
            </Button>
          </UserCan>
        )}
      </div>
    </Card>
  );
};
