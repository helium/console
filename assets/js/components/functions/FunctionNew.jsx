import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import LabelsAppliedNew from '../common/LabelsAppliedNew'
import FunctionValidator from './FunctionValidator'
import FunctionMoveLabelModal from './FunctionMoveLabelModal'
import { createFunction } from '../../actions/function'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Card, Button, Input, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

@connect(null, mapDispatchToProps)
class FunctionNew extends Component {
  state = {
    name: "",
    type: null,
    format: null,
    body: "function Decoder(bytes, port) { \n\n  return decoded; \n}",
    labels: null,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_FUNCTIONS_NEW")
  }

  handleInputUpdate = e => this.setState({ [e.target.name]: e.target.value })

  handleSelectFunctionType = () => this.setState({ type: "decoder" })

  handleSelectFormat = format => this.setState({ format })

  handleFunctionUpdate = body => this.setState({ body })

  handleLabelsUpdate = labels => {
    this.setState({ labels })
  }

  confirmOrOpenModal = (label, openModal, confirm) => {
    if (label.function) {
      openModal(label);
    } else {
      confirm(label);
    }
  }

  handleSubmit = () => {
    const {name, type, format, body, labels} = this.state
    const fxn = { name, type, format, body }
    if (labels) {
      fxn.labels = {
        labelsApplied: labels.labelsApplied.map(l => l.id),
        newLabels: labels.newLabels.map(l => l.name)
      }
    }
    this.props.createFunction(fxn)

    analyticsLogger.logEvent("ACTION_CREATE_FUNCTION", { "name": name, "type": type, "format": format })
  }

  render() {
    const { name, type, format, body } = this.state
    return (
      <DashboardLayout title="Create New Function" user={this.props.user}>
        <Card
 title="Step 1 - Enter Function Details">
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

        <UserCan>
          <Card            title="Labels Applied To">
            <Text style={{margin: '10px 0 30px', display: 'block'}}>Labels are necessary to apply Functions to devices</Text>
            <LabelsAppliedNew
              handleLabelsUpdate={this.handleLabelsUpdate}
              addOrPrompt={this.confirmOrOpenModal}
              ConfirmationModal={FunctionMoveLabelModal}
            />
          </Card>
        </UserCan>

        <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'row' }}>
          <UserCan>
            <Button
              size="large"
              icon="save"
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
