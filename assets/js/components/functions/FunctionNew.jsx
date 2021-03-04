import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import FunctionValidator from './FunctionValidator'
import { createFunction } from '../../actions/function'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Card, Button, Input, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
const { Text } = Typography
const { Option } = Select

@connect(null, mapDispatchToProps)
class FunctionNew extends Component {
  state = {
    name: "",
    type: null,
    format: null,
    body: "function Decoder(bytes, port) { \n\n  return decoded; \n}",
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_FUNCTIONS_NEW")
  }

  handleInputUpdate = e => this.setState({ [e.target.name]: e.target.value })

  handleSelectFunctionType = () => this.setState({ type: "decoder" })

  handleSelectFormat = format => this.setState({ format })

  handleFunctionUpdate = body => this.setState({ body })


  handleSubmit = () => {
    const {name, type, format, body} = this.state
    const fxn = { name, type, format, body }
    this.props.createFunction(fxn)

    analyticsLogger.logEvent("ACTION_CREATE_FUNCTION", { "name": name, "type": type, "format": format })
  }

  render() {
    const { name, type, format, body } = this.state
    return (
      <DashboardLayout title="Add Function" user={this.props.user}>
        <Card title="Step 1 - Enter Function Details">
          <Text>Enter Function Name</Text>
          <div style={{ display: 'flex', flexDirection: 'row', marginTop: 5 }}>
            <Input
              placeholder="e.g. My Decoder"
              name="name"
              value={name}
              onChange={this.handleInputUpdate}
              style={{ width: 220 }}
            />
            <Select
              placeholder="Function Type"
              onSelect={this.handleSelectFunctionType}
              style={{ width: 220, marginLeft: 8 }}
            >
              <Option value="decoder">
                Decoder
              </Option>
            </Select>
            <Select
              placeholder="Choose Format"
              onSelect={this.handleSelectFormat}
              style={{ width: 220, marginLeft: 8 }}
              disabled={!type}
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
        </Card>
        {
          type && format === 'custom' && <FunctionValidator handleFunctionUpdate={this.handleFunctionUpdate} body={body} title="Step 2 - Enter Custom Script"/>
        }
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
          <UserCan>
            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={this.handleSubmit}
              disabled={!type || !format || name.length === 0}
            >
              Save Function
            </Button>
          </UserCan>
        </div>
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createFunction }, dispatch);
}

export default FunctionNew
