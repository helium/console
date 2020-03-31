import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
import { removeAllLabelsFromDevices } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

@connect(null, mapDispatchToProps)
class DeviceRemoveAllLabelsModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { devices, onClose, removeAllLabelsFromDevices } = this.props

    analyticsLogger.logEvent("ACTION_REMOVE_ALL_LABELS_FROM_DEVICES", { devices: devices.map(d => d.id) })
    removeAllLabelsFromDevices(devices)

    onClose()
  }

  render() {
    const { open, onClose, devices } = this.props

    return (
      <Modal
        title="Remove All Labels from Devices"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={devices && devices.length === 0}>
            Submit
          </Button>,
        ]}
      >
        <React.Fragment>
          <div style={{ marginBottom: 20 }}>
            <Text>Are you sure you want to remove all labels from the following devices?</Text>
          </div>
          {
            !devices ? (
              <div>
                <Text>&ndash; No Devices Currently Selected</Text>
              </div>
            ) : (
              devices.map(d => (
                <div key={d.id}>
                  <Text>&ndash; {d.name}: </Text>
                  <Text>
                    {d.labels.length > 0 ? d.labels.map(l => l.name).join(', ') : "No labels attached"}
                  </Text>
                </div>

              ))
            )
          }
        </React.Fragment>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeAllLabelsFromDevices }, dispatch)
}

export default DeviceRemoveAllLabelsModal
