import React, { Component } from 'react'
import ChannelsTable from './ChannelsTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import ChannelCreateRow from './ChannelCreateRow'
import ChannelPremadeRow from './ChannelPremadeRow'
import DeleteChannelModal from './DeleteChannelModal'
import analyticsLogger from '../../util/analyticsLogger'
import classNames from 'classnames';

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
      <p style={{fontSize: 16, marginBottom: 60, maxWidth: 600, marginTop: '-30px', paddingLeft: 4, fontWeight: 300}}>Integrations enable devices to connect to pre-configured, cloud-based applications or send data directly over HTTP or MQTT.</p>
      <div className="flexwrapper">
        <UserCan>
          <Card title="Add a Prebuilt Integration" className="integrationcard">
            <ChannelPremadeRow />
          </Card>
        </UserCan>

        <UserCan>
          <Card title="Add a Custom Integration" className="integrationcard">
            <ChannelCreateRow />
          </Card>
        </UserCan>
        </div>

        <Card title="My Integrations" bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}>
          <ChannelsTable openDeleteChannelModal={this.openDeleteChannelModal} history={this.props.history}/>
        </Card>

        <DeleteChannelModal open={showDeleteChannelModal} onClose={this.closeDeleteChannelModal} channel={channel}/>

        <style jsx>{`
          .flexwrapper {
            display: flex;
            flex-wrap: wrap;

          }

          .integrationcard {
            flex-grow: 1;
          }

          .integrationcard:first-of-type {
            margin-right: 20px;
          }


          `}</style>
      </DashboardLayout>
    )
  }
}

export default ChannelIndex
