import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deleteLabel } from '../../actions/label'

@connect(null, mapDispatchToProps)
class DeleteLabelModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { deleteLabel, labelId, onClose, doNotRedirect, deleteResource } = this.props

    analyticsLogger.logEvent("ACTION_DELETE_LABEL", { labels: [labelId] })
    deleteLabel(labelId, doNotRedirect === true ? false : true)
    .then(response => {
      if (response.status === 204) {
        deleteResource(true)
      }
    })

    onClose()
  }

  render() {
    const { open, onClose, labelId } = this.props

    return (
      <Modal
        title={"Delete Label"}
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
        <div style={{ marginBottom: 20 }}>
          <Text>Are you sure you want to proceed? All devices tagged with this label will remain.</Text>
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteLabel }, dispatch)
}

export default DeleteLabelModal
