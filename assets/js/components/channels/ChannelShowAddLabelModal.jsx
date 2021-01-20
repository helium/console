import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addLabelsToChannel } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input, Divider } from 'antd';
const { Text } = Typography
import AddIcon from '../../../img/channel-show-add-label-icon.png'

@connect(null, mapDispatchToProps)
class ChannelShowAddLabelModal extends Component {
  handleAddLabel = () => {
    const { channel, label, addLabelsToChannel, onClose } = this.props

    addLabelsToChannel([label.id], channel.id)
    analyticsLogger.logEvent("ACTION_ADD_LABELS_TO_CHANNEL", {labels: [label.id], channel: channel.id})

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
            <img src={AddIcon} style={{ height: 24, width: 24}} />
          </div>
          <div>
            <div>
              <Text strong>Are you sure you want to add {label && label.name}?</Text>
            </div>
            <div style={{ marginTop: 10 }}>
              <Text>{label && label.name} contains {label && label.device_count} device(s) which will begin to send data via this integration.</Text>
            </div>
            <Divider />
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
              <Button key="back" onClick={onClose}>
                Cancel
              </Button>
              <Button key="submit" type="primary" onClick={this.handleAddLabel} style={{ marginLeft: 10 }}>
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
  return bindActionCreators({ addLabelsToChannel }, dispatch);
}

export default ChannelShowAddLabelModal
