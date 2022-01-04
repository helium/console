import React, { Component } from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;
import analyticsLogger from "../../util/analyticsLogger";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { deleteChannel } from "../../actions/channel";

@connect(null, mapDispatchToProps)
class DeleteChannelModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    const { channel, onClose, doNotRedirect } = this.props;

    this.props.deleteChannel(channel.id, doNotRedirect === true ? false : true)

    analyticsLogger.logEvent("ACTION_DELETE_CHANNEL", { channel: channel.id });
    onClose();
  };

  renderContent = () => {
    const { channel } = this.props;
    if (!channel) return <div />;
    else
      return (
        <Text>
          Are you sure you want to delete the Integration, <b>{channel.name}</b>
          ?
        </Text>
      );
  };

  render() {
    const { open, onClose, mobile } = this.props;

    return (
      <Modal
        title="Delete Integration"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        bodyStyle={{
          padding: mobile ? "0px 15px" : "20px 50px",
          textAlign: mobile ? "center" : "start",
        }}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            Submit
          </Button>,
        ]}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteChannel }, dispatch);
}

export default DeleteChannelModal;
