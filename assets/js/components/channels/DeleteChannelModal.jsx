import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deleteChannel } from '../../actions/channel'

@connect(null, mapDispatchToProps)
class DeleteChannelModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { channel, onClose } = this.props

    this.props.deleteChannel(channel.id)
    analyticsLogger.logEvent("ACTION_DELETE_CHANNEL", { channel: channel.id })
    onClose()
  }

  renderContent = () => {
    const { channel } = this.props
    if (!channel) return (<div />)
    if (!channel.device_count && channel.labels.length === 0) return (
      <Text>Do you want to delete Integration {channel.name}?</Text>
    )
    if (!channel.device_count && channel.labels.length > 0) return (
      <Text>Do you want to delete Integration {channel.name}? Labels currently connected to this Integration {JSON.stringify(channel.labels.map(l => l.name))} will not be deleted.</Text>
    )
    if (channel.device_count) return (
      <Text>Do you want to delete Integration {channel.name}? Devices with label {JSON.stringify(channel.labels.map(l => l.name))} will be no longer be connected to this Integration.</Text>
    )
  }

  render() {
    const { open, onClose } = this.props

    return (
      <Modal
        title="Delete Integration"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            Submit
          </Button>,
        ]}
      >
        {this.renderContent()}
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteChannel }, dispatch)
}

export default DeleteChannelModal
