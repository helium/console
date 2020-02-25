import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deleteLabel, deleteLabels } from '../../actions/label'

@connect(null, mapDispatchToProps)
class DeleteLabelModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { deleteLabel, deleteLabels, labelsToDelete, onClose } = this.props

    const isArray = Array.isArray(labelsToDelete)

    if (isArray) {
      deleteLabels(labelsToDelete)
    } else {
      deleteLabel(labelsToDelete)
    }

    onClose()
  }

  render() {
    const { open, onClose, labelsToDelete } = this.props
    const isArray = Array.isArray(labelsToDelete)

    return (
      <Modal
        title={isArray ? "Delete Labels" : "Delete Label"}
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={isArray && labelsToDelete.length === 0}>
            Submit
          </Button>,
        ]}
      >
        {
          isArray ? (
            <React.Fragment>
              <div style={{ marginBottom: 20 }}>
                <Text>Are you sure you want to delete the following labels? All devices tagged with these labels will remain.</Text>
              </div>
              {
                labelsToDelete.length == 0 ? (
                  <div>
                    <Text>&ndash; No Labels Currently Selected</Text>
                  </div>
                ) : (
                  labelsToDelete.map(l => (
                    <div key={l.id}>
                      <Text>&ndash; {l.name}</Text>
                    </div>
                  ))
                )
              }
            </React.Fragment>
          ) : (
            <Text>Are you sure you want to delete this label? All devices tagged with this label will remain.</Text>
          )
        }

      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteLabel, deleteLabels }, dispatch)
}

export default DeleteLabelModal
