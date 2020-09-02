import React, { Component } from 'react'
import { Modal, Button, Typography, Checkbox } from 'antd';
import { deleteDevices } from '../../actions/device'
import analyticsLogger from '../../util/analyticsLogger'
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

@connect(null, mapDispatchToProps)
class DeleteDeviceModal extends Component {
  state = {
    applyToAll: false
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { deleteDevices, devicesToDelete, onClose } = this.props
    const { applyToAll } = this.state

    analyticsLogger.logEvent(
      "ACTION_DELETE_DEVICE",
      {
        devices: applyToAll ? 'all' : devicesToDelete.map(d => d.id)
      }
    )
    deleteDevices(!applyToAll && devicesToDelete)
    this.setState({applyToAll: false})

    onClose()
  }

  render() {
    const { open, onClose, devicesToDelete, allDevicesSelected, totalDevices } = this.props;

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
          <Text>{`Are you sure you want to delete the selected devices?`}</Text>
        </div>
        {
          (!devicesToDelete || devicesToDelete.length === 0) ? (
            <div>
              <Text>&ndash; No Devices Currently Selected</Text>
            </div>
          ) : (
            <div>
              <Text>{`${devicesToDelete.length} Device${devicesToDelete.length === 1 ? '' : 's'} Currently Selected`}</Text>
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
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteDevices }, dispatch)
}

export default DeleteDeviceModal
