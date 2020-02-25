import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
import { removeLabelsFromDevice } from '../../actions/label'
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

@connect(null, mapDispatchToProps)
class DeviceRemoveLabelModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { onClose, removeLabelsFromDevice, labels, device } = this.props

    removeLabelsFromDevice(labels, device.id)

    onClose()
  }

  render() {
    const { open, onClose, labels } = this.props

    return (
      <Modal
        title="Remove Label(s) from Device"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={!labels || labels.length === 0}>
            Submit
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 20 }}>
          <Text>Are you sure you want to remove the following label(s) from this device?</Text>
        </div>
        {
          labels && labels.length > 0 && labels.map(l => <div key={l.id}><Text>- {l.name}</Text></div>)
        }
        {
          (!labels || labels.length === 0) && <Text>No Labels Selected</Text>
        }
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeLabelsFromDevice }, dispatch)
}

export default DeviceRemoveLabelModal
