import React, { Component } from 'react'
import { Modal, Button, Typography, Checkbox } from 'antd';
import { deleteDevices, deleteDevice } from '../../actions/device'
import analyticsLogger from '../../util/analyticsLogger'
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const styles = {
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  }
}

@connect(null, mapDispatchToProps)
class DeleteDeviceModal extends Component {
  state = {
    applyToAll: false
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { deleteDevices, deleteDevice, devicesToDelete, onClose, from } = this.props
    const { applyToAll } = this.state

    analyticsLogger.logEvent(
      "ACTION_DELETE_DEVICE",
      {
        devices: applyToAll ? 'all' : devicesToDelete.map(d => d.id)
      }
    )
    if (from == 'deviceShow') {
      deleteDevice(devicesToDelete[0].id, true)
    } else {
      deleteDevices(!applyToAll && devicesToDelete)
    }

    this.setState({applyToAll: false})
    onClose()
  }

  render() {
    const { open, onClose, devicesToDelete, allDevicesSelected, totalDevices, from } = this.props;

    return (
      <Modal
        title={from == 'deviceShow' ? "Delete Device": "Delete Devices"}
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
        <div style={from == 'deviceShow' ? styles.row : { marginBottom: 20 }}>
          <Text>{from == 'deviceShow' ? `Are you sure you want to delete device ${devicesToDelete && devicesToDelete[0].name}?` : 'Are you sure you want to delete the selected devices?'}</Text>
        </div>
        {
          (!devicesToDelete || devicesToDelete.length === 0) && (
            <div>
              <Text>&ndash; No Devices Currently Selected</Text>
            </div>
          )
        }
        {
          (from != "deviceShow" && devicesToDelete && devicesToDelete.length > 1) && (
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
  return bindActionCreators({ deleteDevices, deleteDevice }, dispatch)
}

export default DeleteDeviceModal
