import React, { Component } from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;
import analyticsLogger from "../../util/analyticsLogger";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { deleteFunction } from "../../actions/function";

@connect(null, mapDispatchToProps)
class DeleteFunctionModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { deleteFunction, functionToDelete, onClose, redirect } = this.props;

    analyticsLogger.logEvent("ACTION_DELETE_FUNCTION", {
      function: functionToDelete.id,
    });
    deleteFunction(functionToDelete.id, redirect);

    onClose();
  };

  render() {
    const { open, onClose, functionToDelete } = this.props;

    return (
      <Modal
        title={"Delete Function"}
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
        <Text>
          Are you sure you want to delete the function,{" "}
          <b>{functionToDelete && functionToDelete.name}</b>?
        </Text>
      </Modal>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteFunction }, dispatch);
}

export default DeleteFunctionModal;
