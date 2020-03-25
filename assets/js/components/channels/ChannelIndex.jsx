import React, { Component } from 'react'
import ChannelsTable from './ChannelsTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import ChannelCreateRow from './ChannelCreateRow'
import ChannelPremadeRow from './ChannelPremadeRow'
import DeleteChannelModal from './DeleteChannelModal'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography } from 'antd';
import { Card } from 'antd';
const { Text } = Typography

class ChannelIndex extends Component {
  state = {
    showDeleteChannelModal: false,
    channel: null,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_INDEX")
  }

  openDeleteChannelModal = (channel) => {
    this.setState({ showDeleteChannelModal: true, channel })
  }

  closeDeleteChannelModal = () => {
    this.setState({ showDeleteChannelModal: false })
  }

  render() {
    const { showDeleteChannelModal, channel } = this.state
    return (
      <DashboardLayout title="Integrations">
        <UserCan>
          <Card title="Ready to Use Integrations">
            <ChannelPremadeRow />
          </Card>
        </UserCan>

        <UserCan>
          <Card title="Create your own Integration">
            <ChannelCreateRow />
          </Card>
        </UserCan>

        <Card title="My Integrations" bodyStyle={{padding: '1px 0 20px', overflow: 'hidden' }}>
          <ChannelsTable openDeleteChannelModal={this.openDeleteChannelModal} />
        </Card>

        <DeleteChannelModal open={showDeleteChannelModal} onClose={this.closeDeleteChannelModal} channel={channel}/>
      </DashboardLayout>
    )
  }
}

export default ChannelIndex
