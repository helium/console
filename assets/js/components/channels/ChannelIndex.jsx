import React, { Component } from 'react'
import ChannelsTable from './ChannelsTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import ChannelCreateRow from './ChannelCreateRow'
import ChannelCargoRow from './ChannelCargoRow'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography } from 'antd';
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
          <Text strong>
            Use Helium Cargo
          </Text>

          <ChannelCargoRow />

          <Text strong>
            Create New Channel
          </Text>

          <ChannelCreateRow />
        </UserCan>
        <br />

        <ChannelsTable />
      </DashboardLayout>
    )
  }
}

export default ChannelIndex
