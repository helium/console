import React from 'react';
import UserCan from '../common/UserCan'
import { Typography, Card, Button, Input, Select } from 'antd';
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
const { Text } = Typography
const { Option } = Select
import { functionTypes, functionFormats } from './constants';

export default ({fxn, name, type, format, body, handleInputUpdate, handleSelectFunctionType, handleSelectFormat, clearInputs, handleSubmit, horizontal }) => {
  return(
    <Card title="Function Details">
      <Text>Update Function</Text>
      <div style={{ marginTop: 5 }}>
        <div>
          <Input
            placeholder={fxn.name}
            name="name"
            value={name}
            onChange={handleInputUpdate}
            style={horizontal ? { width: 220 } : { width: '100%', marginBottom: 11 }}
          />
          <Select
            placeholder={functionTypes[fxn.type]}
            onSelect={handleSelectFunctionType}
            style={horizontal ? { width: 220, marginLeft: 8 } : { width: '100%', marginBottom: 7 }}
            value={type}
          >
            <Option value="decoder">
              Decoder
            </Option>
          </Select>
          <Select
            placeholder={functionFormats[fxn.format]}
            onSelect={handleSelectFormat}
            style={horizontal ? { width: 220, marginLeft: 8 } : { width: '100%', marginBottom:7 }}
            value={format}
          >
            <Option value="browan_object_locator">
              Browan Object Locator
            </Option>
            <Option value="cayenne">
              Cayenne LPP
            </Option>
            <Option value="custom">
              Custom Script
            </Option>
          </Select>
        </div>
        <Button
          icon={<DeleteOutlined />}
          onClick={clearInputs}
        >
          Clear
        </Button>

        {horizontal ?
          (<div>
            <UserCan>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={handleSubmit}
                disabled={!type && !format && name.length === 0 && body.length === 0}
                style={{ marginTop: 20 }}
              >
                Save Changes
              </Button>
            </UserCan>
          </div>) :
          (<UserCan>
            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={handleSubmit}
              disabled={!type && !format && name.length === 0 && body.length === 0}
            >
              Save Changes
            </Button>
          </UserCan>)
        }
      </div>
    </Card>
  );
}
