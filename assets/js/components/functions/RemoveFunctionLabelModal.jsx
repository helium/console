import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { removeLabelFromFunction } from '../../actions/label'

@connect(null, mapDispatchToProps)
class RemoveFunctionLabelModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const {removeLabelFromFunction, functionSelected, labelToRemove, onClose } = this.props

    analyticsLogger.logEvent("ACTION_REMOVE_LABEL_FROM_FUNCTION", { function: functionSelected.id, label: labelToRemove.id })
    removeLabelFromFunction(labelToRemove.id, functionSelected.id)

    onClose()
  }

  render() {
    const { open, onClose, functionSelected, labelToRemove } = this.props

    return (
      <Modal
        title={"Remove Label from Function"}
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
        <Text>Are you sure you want to remove label {labelToRemove && labelToRemove.name} from function {functionSelected && functionSelected.name}?</Text>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeLabelFromFunction }, dispatch)
}

export default RemoveFunctionLabelModal
