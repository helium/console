import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deleteLabel } from '../../actions/label'

@connect(null, mapDispatchToProps)
class DeleteLabelModal extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { deleteLabel, labelId, onClose } = this.props

    deleteLabel(labelId)
    onClose()
  }

  render() {
    const { open, onClose } = this.props

    return (
      <Modal
        title="Delete Label"
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
        <Text>Are you sure you want to delete this label? All devices tagged with this label will remain.</Text>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteLabel }, dispatch)
}

export default DeleteLabelModal
