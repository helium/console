import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
import { deleteDevices } from '../../actions/device'
import analyticsLogger from '../../util/analyticsLogger'
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

@connect(null, mapDispatchToProps)
class DeleteDeviceModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { deleteDevices, devicesToDelete, onClose } = this.props

    analyticsLogger.logEvent("ACTION_DELETE_DEVICE", { devices: devicesToDelete.map(d => d.id) })
    deleteDevices(devicesToDelete)

    onClose()
  }

  render() {
    const { open, onClose, devicesToDelete } = this.props

    return (
      <Modal
        title="Delete Devices"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={devicesToDelete && devicesToDelete.length === 0}>
            Submit
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 20 }}>
          <Text>Are you sure you want to delete the following devices?</Text>
        </div>
        {
          devicesToDelete && devicesToDelete.length == 0 ? (
            <div>
              <Text>&ndash; No Devices Currently Selected</Text>
            </div>
          ) : (
            devicesToDelete && devicesToDelete.map(d => (
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
  return bindActionCreators({ deleteDevices }, dispatch)
}

export default DeleteDeviceModal
