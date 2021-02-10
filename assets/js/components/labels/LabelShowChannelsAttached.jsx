import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { connect } from 'react-redux'
import find from 'lodash/find'
import analyticsLogger from '../../util/analyticsLogger'
import { bindActionCreators } from 'redux'
import { DeleteOutlined } from '@ant-design/icons';
import { Typography, Button, Card, Select } from 'antd';
import { ALL_CHANNELS } from '../../graphql/channels'
import { push } from 'connected-react-router';
import { addChannelToLabel } from '../../actions/label'
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(ALL_CHANNELS, queryOptions)
class LabelShowChannelsAttached extends Component {
  state = {
    selectedChannel: null
  }

  selectChannel = id => {
    this.setState({ selectedChannel: id })
  }

  handleAddChannelToLabel = () => {
    this.props.addChannelToLabel(this.props.label.id, this.state.selectedChannel)
    analyticsLogger.logEvent("ACTION_ADD_CHANNEL_TO_LABEL", { "channel_id": this.state.selectedChannel, "label_id": this.props.label.id })
  }

  render() {
    const { channels } = this.props
    const { selectedChannel } = this.state
    const { allChannels } = this.props.data

    return (
      <div>
        <Card title="Added Integrations">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ borderRight: "1px solid #e1e4e8", marginRight: 20, height: 75, minWidth: 310 }}>
              <Text style={{ display: 'block' }}>Add an Integration</Text>

              <Select
                value={selectedChannel}
                onChange={this.selectChannel}
                style={{ width: 220 }}
              >
                {
                  allChannels && allChannels.reduce((acc, c) => {
                    if (find(channels, { id: c.id })) return acc
                    return acc.concat(<Option value={c.id} key={c.id}>{c.name}</Option>)
                  }, [])
                }
              </Select>
              <Button style={{ marginLeft: 8, marginRight: 20 }} onClick={this.handleAddChannelToLabel}>
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
                    <Button size="small" type="danger" shape="circle" icon={<DeleteOutlined />} style={{ marginLeft: 8, marginBottom: 8 }}/>
                  </span>
                ))
              }
            </div>
          </div>
        </Card>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push, addChannelToLabel }, dispatch)
}

export default LabelShowChannelsAttached
