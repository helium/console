import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import { removeChannelFromLabel } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

@connect(null, mapDispatchToProps)
class LabelShowRemoveChannelModal extends Component {
  handleSubmit = (e) => {
    const { onClose, channelToDelete, label, removeChannelFromLabel } = this.props
    e.preventDefault();

    analyticsLogger.logEvent("ACTION_REMOVE_CHANNEL_FROM_LABEL", { channel: channelToDelete.id, label: label.id })
    removeChannelFromLabel(label.id, channelToDelete.id)

    onClose()
  }

  render() {
    const { open, onClose, channelToDelete } = this.props

    return (
      <Modal
        title={"Remove Function from Label"}
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
        <Text>Are you sure you want to remove integration <Text strong>{channelToDelete && channelToDelete.name}</Text> from this label?</Text>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeChannelFromLabel }, dispatch)
}

export default LabelShowRemoveChannelModal
