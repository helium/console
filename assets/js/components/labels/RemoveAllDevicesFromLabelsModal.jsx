import React, { Component } from 'react'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { removeAllDevicesFromLabels } from '../../actions/label'
import { displayError } from '../../util/messages'
import analyticsLogger from '../../util/analyticsLogger'

@connect(null, mapDispatchToProps)
class RemoveAllDevicesFromLabelsModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { labels, removeAllDevicesFromLabels, onClose } = this.props

    analyticsLogger.logEvent("ACTION_REMOVE_ALL_DEVICES_FROM_LABELS",  {labels: labels.map(l => l.id)})
    removeAllDevicesFromLabels(labels)

    onClose()
  }

  render() {
    const { open, onClose, labels } = this.props

    return (
      <Modal
        title="Remove All Devices from Labels"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={labels && labels.length === 0}>
            Submit
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 20 }}>
          <Text>Are you sure you want to remove all devices from the following labels?</Text>
        </div>
        {
          !labels ? (
            <div>
              <Text>&ndash; No Labels Currently Selected</Text>
            </div>
          ) : (
            labels.map(l => (
              <div key={l.id}>
                <Text>&ndash; {l.name}: {l.devices.length} Devices Attached</Text>
              </div>
            ))
          )
        }
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeAllDevicesFromLabels }, dispatch)
}

export default RemoveAllDevicesFromLabelsModal
