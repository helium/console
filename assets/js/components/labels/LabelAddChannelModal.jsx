import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import { addLabelsToChannel } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
import { ALL_CHANNELS } from '../../graphql/channels'
import { Modal, Button, Select, Typography } from 'antd';
const { Option } = Select
const { Text } = Typography

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(ALL_CHANNELS, queryOptions)
class LabelAddChannelModal extends Component {
  state = {
    channelId: null
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { channelId } = this.state
    const labelIds = this.props.labels.map(l => l.id)

    this.props.addLabelsToChannel(labelIds, channelId)
    analyticsLogger.logEvent("ACTION_ADD_LABELS_TO_CHANNEL", { labels: labelIds, channel: channelId })

    this.props.onClose()
  }

  handleSelectOption = (channelId) => {
    this.setState({ channelId })
  }

  render() {
    const { open, onClose, labels } = this.props
    const { allChannels } = this.props.data

    return (
      <Modal
        title={`Add Integration to ${labels ? labels.length : 0} Label${labels && labels.length === 1 ? "" : "s"}`}
        visible={open}
        centered
        onCancel={onClose}
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={this.handleSubmit}
            disabled={!labels || labels.length === 0}
          >
            Add Integration
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Text>Select an integration to attach to your selected Label{labels && labels.length === 1 ? "" : "s"}:</Text>

          <Select
            onChange={this.handleSelectOption}
            style={{ width: 200, marginTop: 12 }}
          >
            {allChannels && allChannels.map(c => (
              <Option value={c.id} key={c.id}>{c.name}</Option>
            ))}
          </Select>
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addLabelsToChannel }, dispatch)
}

export default LabelAddChannelModal
