import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createLabel } from '../../actions/label'
import { graphql } from 'react-apollo';
import { ALL_CHANNELS } from '../../graphql/channels'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input, Select, Divider } from 'antd';
const { Text } = Typography
const { Option } = Select

@connect(null, mapDispatchToProps)
class CreateLabelModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labelName: "",
      channelId: null,
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelectOption = this.handleSelectOption.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit(e, redirect = false) {
    e.preventDefault();
    const { labelName, channelId } = this.state;

    analyticsLogger.logEvent("ACTION_CREATE_LABEL", {"name": labelName})
    this.props.createLabel(labelName, channelId, redirect)

    this.props.onClose()
  }

  handleSelectOption(channelId) {
    this.setState({ channelId })
  }

  render() {
    const { open, onClose, data } = this.props

    return (
      <Modal
        title="Create New label"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" onClick={this.handleSubmit}>
            Create Label
          </Button>,
          <Button key="submit2" onClick={e => this.handleSubmit(e, true)} type="primary">
            Create Label & Manage
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
        <Text style={{ marginBottom: 20, color: '#8C8C8C' }}>Label names must be unique</Text>

        <Divider />

        <Text strong>Step 2 - Attach an Integration (Optional)</Text>
        <Select
          placeholder="Choose Integration"
          style={{ width: 220, marginRight: 10, marginTop: 10 }}
          onSelect={this.handleSelectOption}
        >
          {
            data.allChannels && data.allChannels.map(c => (
              <Option value={c.id} key={c.id}>
                {c.name}
              </Option>
            ))
          }
        </Select>

      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createLabel }, dispatch)
}

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

export default graphql(ALL_CHANNELS, queryOptions)(CreateLabelModal)
