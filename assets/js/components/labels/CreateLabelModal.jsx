import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createLabel } from '../../actions/label'
import withGql from '../../graphql/withGql'
import { ALL_CHANNELS_FUNCTIONS } from '../../graphql/channels'
import { grayForModalCaptions } from '../../util/colors'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input, Select, Divider } from 'antd';
const { Text } = Typography
const { Option } = Select

class CreateLabelModal extends Component {
  state = {
    labelName: "",
    channelId: null,
    functionId: null,
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = (e, redirect = false) => {
    e.preventDefault();
    const { labelName, channelId, functionId } = this.state;

    analyticsLogger.logEvent("ACTION_CREATE_LABEL", {"name": labelName})
    this.props.createLabel({ name: labelName, channel_id: channelId, function_id: functionId }, redirect)

    this.props.onClose()
  }

  handleSelectChannel = (channelId) => {
    this.setState({ channelId })
  }

  handleSelectFunction = (functionId) => {
    this.setState({ functionId })
  }

  render() {
    const { open, onClose } = this.props
    const { allChannels, allFunctions, error } = this.props.allResourcesQuery

    return (
      <Modal
        title="Add Label"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" onClick={this.handleSubmit}>
            Add Label
          </Button>,
          <Button key="submit2" onClick={e => this.handleSubmit(e, true)} type="primary">
            Add Label & Manage
          </Button>
        ]}
      >
        <Text strong>Step 1 - Enter a Label Name</Text>
        <Input
          placeholder="Enter Label Name"
          name="labelName"
          value={this.state.labelName}
          onChange={this.handleInputUpdate}
          style={{ marginTop: 10 }}
        />
        <Text style={{ marginBottom: 20, marginTop: 10, fontSize: 14, color: grayForModalCaptions }}>Label names must be unique</Text>

        <Divider />

        <Text strong>Step 2 - Add Label Attachments (Optional)</Text>
        <div>
          <Select
            placeholder={error ? "No Integrations Available" : "Choose Integration"}
            style={{ width: '100%', marginRight: 10, marginTop: 10 }}
            onSelect={this.handleSelectChannel}
          >
            {
              allChannels && allChannels.map(c => (
                <Option value={c.id} key={c.id}>
                  {c.name}
                </Option>
              ))
            }
          </Select>

          <Select
            placeholder={error ? "No Functions Available" : "Choose Function"}
            style={{ width: '100%', marginRight: 10, marginTop: 10 }}
            onSelect={this.handleSelectFunction}
          >
            {
              allFunctions && allFunctions.map(c => (
                <Option value={c.id} key={c.id}>
                  {c.name}
                </Option>
              ))
            }
          </Select>
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createLabel }, dispatch)
}

export default connect(null, mapDispatchToProps)(
  withGql(CreateLabelModal, ALL_CHANNELS_FUNCTIONS, props => ({ fetchPolicy: 'cache-and-network', variables: {}, name: 'allResourcesQuery' }))
)
