import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { removeLabelsFromChannel } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input, Divider } from 'antd';
const { Text } = Typography
import RemoveIcon from '../../../img/channel-show-remove-label-icon.png'

@connect(null, mapDispatchToProps)
class ChannelShowRemoveLabelModal extends Component {
  handleRemoveLabel = () => {
    const { channel, label, removeLabelsFromChannel, onClose } = this.props

    removeLabelsFromChannel([label.id], channel.id)
    analyticsLogger.logEvent("ACTION_REMOVE_LABELS_FROM_CHANNEL", {labels: [label.id], channel: channel.id})

    onClose()
  }

  render() {
    const { onClose, open, label } = this.props
    return (
      <Modal
        visible={open}
        onCancel={onClose}
        centered
        footer={null}
        closable={false}
      >
        <div style={{ display: 'flex', flexDirection: 'row'}}>
          <div style={{ height: 24, width: 24, marginRight: 15 }}>
            <img src={RemoveIcon} style={{ height: 24, width: 24}} />
          </div>
          <div>
            <div>
              <Text strong>Are you sure you want to remove {label && label.name}?</Text>
            </div>
            <div style={{ marginTop: 10 }}>
              <Text>{label && label.name} contains {label && label.devices.length} device(s) which will no longer send data via this integration.</Text>
            </div>
            <Divider />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
              <Button key="back" onClick={onClose}>
                Cancel
              </Button>
              <Button key="submit" type="primary" onClick={this.handleRemoveLabel} style={{ marginLeft: 10 }}>
                OK
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeLabelsFromChannel }, dispatch);
}

export default ChannelShowRemoveLabelModal
