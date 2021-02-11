import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import { removeLabelFromFunction } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

@connect(null, mapDispatchToProps)
class LabelShowRemoveFunctionModal extends Component {
  handleSubmit = (e) => {
    const { onClose, functionToDelete, label, removeLabelFromFunction } = this.props
    e.preventDefault();

    analyticsLogger.logEvent("ACTION_REMOVE_FUNCTION_FROM_LABEL", { function: functionToDelete.id, label: label.id })
    removeLabelFromFunction(label.id, functionToDelete.id)

    onClose()
  }

  render() {
    const { open, onClose, functionToDelete } = this.props

    return (
      <Modal
        title={"Remove Function from Label"}
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            Submit
          </Button>,
        ]}
      >
        <Text>Are you sure you want to remove function <Text strong>{functionToDelete && functionToDelete.name}</Text> from this label?</Text>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeLabelFromFunction }, dispatch)
}

export default LabelShowRemoveFunctionModal
