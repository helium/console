import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import analyticsLogger from '../../util/analyticsLogger'
import { ALL_LABELS } from '../../graphql/labels'
import { addDevicesToLabel, addDevicesToNewLabel } from '../../actions/label'
import LabelTag from '../common/LabelTag'
import { Modal, Button, Typography, Input, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

@connect(null, mapDispatchToProps)
class DevicesAddLabelModal extends Component {
  state = {
    labelId: null,
    labelName: null,
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { labelName, labelId } = this.state
    const deviceIds = this.props.devicesToUpdate.map(d => d.id)

    if (labelId) {
      this.props.addDevicesToLabel(deviceIds, labelId)
      analyticsLogger.logEvent("ACTION_ADD_LABEL_TO_DEVICES", {devices: devicesIds, label: labelId})
    } else if (labelName) {
      this.props.addDevicesToNewLabel(deviceIds, labelName)
      analyticsLogger.logEvent("ACTION_ADD_LABEL_TO_DEVICES", {devices: devicesIds, label_name: labelName})
    }

    this.props.onClose()
  }

  handleSelectOption = (labelId) => {
    this.setState({ labelId })
  }

  render() {
    const { open, onClose, devicesToUpdate, data } = this.props
    const { labelName, labelId } = this.state

    return (
      <Modal
        title={`Add Label to ${devicesToUpdate ? devicesToUpdate.length : 0} Devices`}
        visible={open}
        centered
        onCancel={onClose}
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={this.handleSubmit}
            disabled={!devicesToUpdate || devicesToUpdate.length === 0 || (!labelName && !labelId)}
          >
            Add Label
          </Button>,
        ]}
      >
        <div>
          <Select
            placeholder="Choose Label"
            style={{ width: 220, marginRight: 10 }}
            onSelect={this.handleSelectOption}
          >
            {
              data.allLabels && data.allLabels.map(l => (
                <Option value={l.id} key={l.id}>
                  <LabelTag text={l.name} color={l.color} />
                </Option>
              ))
            }
          </Select>
        </div>

        <div style={{ marginTop: 15, marginBottom: 15 }}>
          <Text style={{ color: '#8C8C8C' }}>or</Text>
        </div>

        <div>
          <Text>Create New Label</Text>
          <Input
            placeholder="Enter Label Name"
            name="labelName"
            value={this.state.labelName}
            onChange={this.handleInputUpdate}
          />
          <Text style={{ marginBottom: 20, color: '#8C8C8C' }}>Label names must be unique</Text>
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addDevicesToLabel, addDevicesToNewLabel }, dispatch)
}

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

export default graphql(ALL_LABELS, queryOptions)(DevicesAddLabelModal)
