import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import find from 'lodash/find'
import sortBy from 'lodash/sortBy'
import analyticsLogger from '../../util/analyticsLogger'
import { bindActionCreators } from 'redux'
import { DeleteOutlined } from '@ant-design/icons';
import { Typography, Button, Card, Select } from 'antd';
import LabelShowRemoveChannelModal from './LabelShowRemoveChannelModal'
import { ALL_CHANNELS } from '../../graphql/channels'
import { push } from 'connected-react-router';
import { addChannelToLabel } from '../../actions/label'
const { Text } = Typography
const { Option } = Select

class LabelShowChannelsAttached extends Component {
  state = {
    selectedChannel: null,
    showRemoveChannelModal: false,
    channelToDelete: null
  }

  selectChannel = id => {
    this.setState({ selectedChannel: id })
  }

  openRemoveChannelModal = (channelToDelete) => {
    this.setState({ showRemoveChannelModal: true, channelToDelete })
  }

  closeRemoveChannelModal = () => {
    this.setState({ showRemoveChannelModal: false })
  }

  handleAddChannelToLabel = () => {
    this.props.addChannelToLabel(this.props.label.id, this.state.selectedChannel)
    analyticsLogger.logEvent("ACTION_ADD_CHANNEL_TO_LABEL", { "channel_id": this.state.selectedChannel, "label_id": this.props.label.id })
  }

  render() {
    const { channels, label } = this.props
    const { selectedChannel, showRemoveChannelModal, channelToDelete } = this.state
    const { allChannels } = this.props.allChannelsQuery

    return (
      <div>
        <Card title="Added Integrations">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ borderRight: "1px solid #e1e4e8", marginRight: 20, height: 75, minWidth: 310 }}>
              <Text style={{ display: 'block' }}>Select an Integration</Text>

              <Select
                value={selectedChannel}
                onChange={this.selectChannel}
                style={{ width: 220 }}
              >
                {
                  allChannels && sortBy(allChannels, ["name"]).reduce((acc, c) => {
                    if (find(channels, { id: c.id })) return acc
                    return acc.concat(<Option value={c.id} key={c.id}>{c.name}</Option>)
                  }, [])
                }
              </Select>
              <Button style={{ marginLeft: 8, marginRight: 20 }} onClick={this.handleAddChannelToLabel} disabled={!selectedChannel}>
                Add
              </Button>
            </div>
            <div style={{ height: 75 }}>
              <Text style={{ display: 'block', marginBottom: 4 }}>Attached Integrations</Text>
              {
                channels && channels.map(c => (
                  <span key={c.id}>
                    <a
                      href={`/integrations/${c.id}`}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.props.push(`/integrations/${c.id}`)
                      }}
                    >
                      {c.name}
                    </a>
                    <Button
                      size="small"
                      type="danger"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      style={{ marginLeft: 8, marginBottom: 8 }}
                      onClick={() => this.openRemoveChannelModal(c)}
                    />
                  </span>
                ))
              }
            </div>
          </div>
        </Card>

        <LabelShowRemoveChannelModal
          open={showRemoveChannelModal}
          onClose={this.closeRemoveChannelModal}
          channelToDelete={channelToDelete}
          label={label}
        />
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push, addChannelToLabel }, dispatch)
}

export default connect(null, mapDispatchToProps)(
  withGql(LabelShowChannelsAttached, ALL_CHANNELS, props => ({ fetchPolicy: 'cache-first', variables: {}, name: 'allChannelsQuery' }))
)
