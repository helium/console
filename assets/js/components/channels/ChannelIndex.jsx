import React, { Component } from 'react'
import ChannelsTable from './ChannelsTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import ChannelCreateRow from './ChannelCreateRow'
import ChannelCargoRow from './ChannelCargoRow'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography } from 'antd';
import { Card } from 'antd';
const { Text } = Typography

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  },
}

class ChannelIndex extends Component {
  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_INDEX")
  }

  render() {
    const { classes } = this.props
    return (
      <DashboardLayout title="Channels">
        <UserCan action="create" itemType="channel">
              <Card title="Use Helium Cargo">

          <ChannelCargoRow />
          </Card>
         
          <Card title="Create Own Channel">
          <ChannelCreateRow />
          </Card>
        </UserCan>
        <Card title="My Channels">
        <ChannelsTable />
        </Card>
      </DashboardLayout>
    )
  }
}

export default ChannelIndex
