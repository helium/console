import React, { Component } from 'react'
import { Modal, Button, Typography, Checkbox } from 'antd';
import { removeAllLabelsFromDevices } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

@connect(null, mapDispatchToProps)
class DeviceRemoveAllLabelsModal extends Component {
  state = {
    applyToAll: false
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { devices, onClose, removeAllLabelsFromDevices } = this.props
    const { applyToAll } = this.state

    analyticsLogger.logEvent(
      "ACTION_REMOVE_ALL_LABELS_FROM_DEVICES",
      { devices: applyToAll ? 'all' : devices.map(d => d.id) }
    )
    removeAllLabelsFromDevices(!applyToAll && devices)
    this.setState({applyToAll: false});

    onClose()
  }

  render() {
    const { open, onClose, devices, allDevicesSelected, totalDevices } = this.props

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
            <Text>{`Are you sure you want to remove all labels from the selected devices?`}</Text>
          </div>
          {
            (!devices || devices.length === 0) ? (
              <div>
                <Text>&ndash; No Devices Currently Selected</Text>
              </div>
            ) : (
              <div>
                <Text>{`${devices.length} Device${devices.length === 1 ? '' : 's'} Currently Selected`}</Text>
              </div>
            )
          }
          {
          allDevicesSelected && 
          <Checkbox
            style={{marginTop: 20}}
            checked={this.state.applyToAll}
            onChange={(e) => this.setState({applyToAll: e.target.checked})}
          >
            {`Apply to all ${totalDevices} devices?`}
          </Checkbox>
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
