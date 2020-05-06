import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import RemoveIcon from '../../../img/channel-show-remove-label-icon.png'

class FunctionMoveLabelModal extends Component {
  submit = () => {
    const { onClose, confirmAddLabel, label } = this.props

    confirmAddLabel(label)
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
              <Text strong>That Label already has a function assigned.</Text>
            </div>
            <div style={{ marginTop: 10 }}>
              <Text>Moving it to this function, will mean it is removed from its currently assigned function {label && label.function && label.function.name}.</Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
              <Button key="back" onClick={onClose}>
                Cancel
              </Button>
              <Button key="submit" type="primary" onClick={this.submit} style={{ marginLeft: 10 }}>
                OK, Move Label
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default FunctionMoveLabelModal
