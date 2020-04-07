import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import FunctionValidator from './FunctionValidator'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Card, Button, Input, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

class FunctionNew extends Component {
  state = {
    functionName: "",
    type: null,
    format: null
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_FUNCTIONS_NEW")
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSelectFunctionType = () => this.setState({ type: "decoder" })
  handleSelectFormat = format => this.setState({ format })

  render() {
    const {functionName, type, format} = this.state
    return (
      <DashboardLayout title="Create New Function">
        <Card title="Step 1 - Enter Function Details">
          <Text>Enter Function Name</Text>
          <div style={{ display: 'flex', flexDirection: 'row', marginTop: 5 }}>
            <Input
              placeholder="e.g. My Decoder"
              name="functionName"
              value={functionName}
              onChange={this.handleInputUpdate}
              style={{ width: 220 }}
            />
            <Select
              placeholder="Function Type"
              onSelect={this.handleSelectFunctionType}
              style={{ width: 220, marginLeft: 8 }}
            >
              <Option value="Decoder">
                Decoder
              </Option>
            </Select>
            <Select
              placeholder="Choose Format"
              onSelect={this.handleSelectFormat}
              style={{ width: 220, marginLeft: 8 }}
              disabled={!type}
            >
              <Option value="cayenne">
                Cayenne LPP
              </Option>
              <Option value="custom">
                Custom Script
              </Option>
            </Select>
          </div>
        </Card>
        {
          true && <FunctionValidator />
        }

        <UserCan>
          <Card title="Labels Applied To">
          </Card>
        </UserCan>

        <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row' }}>
          <UserCan>
            <Button
              size="large"
              icon="save"
              type="primary"
              onClick={null}
            >
              Save Function
            </Button>
          </UserCan>
        </div>
      </DashboardLayout>
    )
  }
}

export default FunctionNew
