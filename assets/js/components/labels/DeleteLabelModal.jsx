import React, { Component } from 'react'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { deleteLabels } from '../../actions/label'

@connect(null, mapDispatchToProps)
class DeleteLabelModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { deleteLabels, labelsToDelete, onClose } = this.props

    analyticsLogger.logEvent("ACTION_DELETE_LABEL", { labels: labelsToDelete.map(d => d.id) })
    deleteLabels(labelsToDelete)

    onClose()
  }

  render() {
    const { open, onClose, labelsToDelete } = this.props

    return (
      <Modal
        title={"Delete Labels"}
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={labelsToDelete && labelsToDelete.length === 0}>
            Submit
          </Button>,
        ]}
      >
        {
          labelsToDelete && labelsToDelete.length === 1 && (
            <React.Fragment>
              <div style={{ marginBottom: 20 }}>
                <Text>The {labelsToDelete[0].channels.map(c => c.name).join(", ")} integration{`${labelsToDelete[0].channels.length == 1 ? " is" : "s are"}`} mapped to this label. Are you sure you want to proceed? All devices tagged with this label will remain.</Text>
              </div>
            </React.Fragment>
          )
        }
        {
          labelsToDelete && labelsToDelete.length > 1 && (
            <React.Fragment>
              <div style={{ marginBottom: 20 }}>
                <Text>Are you sure you want to delete the following labels? All devices tagged with these labels will remain.</Text>
              </div>
              {
                labelsToDelete.map(l => (
                  <div key={l.id}>
                    <Text>&ndash; {l.name}</Text>
                  </div>
                ))
              }
            </React.Fragment>
          )
        }
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteLabels }, dispatch)
}

export default DeleteLabelModal
