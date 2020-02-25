import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
import { deleteDevice, deleteDevices } from '../../actions/device'
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

@connect(null, mapDispatchToProps)
class DeleteDeviceModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { deleteDevice, deleteDevices, devicesToDelete, onClose } = this.props
    const isArray = Array.isArray(devicesToDelete)

    if (isArray) {
      deleteDevices(devicesToDelete)
    } else {
      deleteDevice(devicesToDelete)
    }

    onClose()
  }

  render() {
    const { open, onClose, devicesToDelete } = this.props
    const isArray = Array.isArray(devicesToDelete)

    return (
      <Modal
        title={isArray ? "Delete Devices" : "Delete Device"}
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={isArray && devicesToDelete.length === 0}>
            Submit
          </Button>,
        ]}
      >
        {
          isArray ? (
            <React.Fragment>
              <div style={{ marginBottom: 20 }}>
                <Text>Are you sure you want to delete the following devices?</Text>
              </div>
              {
                devicesToDelete.length == 0 ? (
                  <div>
                    <Text>&ndash; No Devices Currently Selected</Text>
                  </div>
                ) : (
                  devicesToDelete.map(d => (
                    <div key={d.id}>
                      <Text>&ndash; {d.name}</Text>
                    </div>
                  ))
                )
              }
            </React.Fragment>
          ) : (
            <Text>Are you sure you want to delete this device?</Text>
          )
        }
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteDevice, deleteDevices }, dispatch)
}

export default DeleteDeviceModal
