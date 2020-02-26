import React, { Component } from 'react'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { removeDevicesFromLabel } from '../../actions/label'
import { displayError } from '../../util/messages'
import analyticsLogger from '../../util/analyticsLogger'

@connect(null, mapDispatchToProps)
class RemoveDevicesFromLabelModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { devicesToRemove, removeDevicesFromLabel, label, onClose } = this.props

    if (devicesToRemove.length === 0) displayError("No devices are selected for removal")
    else {
      analyticsLogger.logEvent("ACTION_REMOVE_DEVICES_FROM_LABEL",  {id: label.id, devices: devicesToRemove.map(d => d.id)})
      removeDevicesFromLabel(devicesToRemove, label.id)
    }

    onClose()
  }

  render() {
    const { open, onClose, devicesToRemove } = this.props

    return (
      <Modal
        title="Remove Devices from Label"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={devicesToRemove.length === 0}>
            Submit
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 20 }}>
          <Text>Are you sure you want to remove the following devices from this label?</Text>
        </div>
        {
          devicesToRemove.length == 0 ? (
            <div>
              <Text>&ndash; No Devices Currently Selected</Text>
            </div>
          ) : (
            devicesToRemove.map(d => (
              <div key={d.id}>
                <Text>&ndash; {d.name}</Text>
              </div>
            ))
          )
        }
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeDevicesFromLabel }, dispatch)
}

export default RemoveDevicesFromLabelModal
