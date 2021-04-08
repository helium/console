import React, { Component } from 'react'
import { connect } from 'react-redux';
import withGql from '../../graphql/withGql'
import ChannelIndexTable from './ChannelIndexTable'
import ChannelNew from './ChannelNew'
import DashboardLayout from '../common/DashboardLayout'
import AddResourceButton from '../common/AddResourceButton'
import DeleteChannelModal from './DeleteChannelModal'
import analyticsLogger from '../../util/analyticsLogger'
import { PAGINATED_CHANNELS } from '../../graphql/channels'
import { SkeletonLayout } from '../common/SkeletonLayout';
import NavPointTriangle from '../common/NavPointTriangle';
import HomeIcon from '../../../img/channels/channel-index-home-icon.svg'
import PlusIcon from '../../../img/channels/channel-index-plus-icon.svg'
import AllIcon from '../../../img/channels/channel-index-all-icon.svg'
import _JSXStyle from "styled-jsx/style"
import { Typography } from 'antd';
import { Card } from 'antd';
const { Text } = Typography

class ChannelIndex extends Component {
  state = {
    channelSelected: null,
    page: 1,
    pageSize: 10,
    showPage: "allChannels",
    showDeleteChannelModal: false,
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_INDEX")

    this.channel = socket.channel("graphql:channels_index_table", {})
    this.channel.join()
    this.channel.on(`graphql:channels_index_table:${currentOrganizationId}:channel_list_update`, (message) => {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    })

    if (!this.props.paginatedChannelsQuery.loading) {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    }

    if (this.props.history.location.search === '?show_new=true') {
      this.setState({ showPage: "new" })
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { refetch } = this.props.paginatedChannelsQuery
    refetch({ page, pageSize })
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  openDeleteChannelModal = (channelSelected) => {
    this.setState({ showDeleteChannelModal: true, channelSelected })
  }

  closeDeleteChannelModal = () => {
    this.setState({ showDeleteChannelModal: false })
  }

  render() {
    const { channels, loading, error } = this.props.paginatedChannelsQuery
    const { showDeleteChannelModal, channelSelected, showPage } = this.state

    return (
      <DashboardLayout title="My Integrations" user={this.props.user} noAddButton>
        <div style={{ height: '100%', width: '100%', backgroundColor: '#ffffff', borderRadius: 6, overflow: 'hidden', boxShadow: '0px 20px 20px -7px rgba(17, 24, 31, 0.19)' }}>
          <div style={{ padding: 20, backgroundColor: '#0dc699', display: 'flex', flexDirection: 'row', overflowX: 'scroll' }}>
            <div
              style={{
                backgroundColor: '#10b48c',
                borderRadius: 6,
                padding: 10,
                cursor: 'pointer',
                height: 50,
                width: 50,
                minWidth: 50,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                position: 'relative'
              }}
              onClick={() => this.setState({ showPage: 'home'})}
            >
              <img src={HomeIcon} style={{ height: 20, paddingLeft: 2 }} />
              {showPage === 'home' && <NavPointTriangle />}
            </div>

            <div style={{
              backgroundColor: '#10b48c',
              borderRadius: 6,
              padding: '5px 10px 5px 10px',
              cursor: 'pointer',
              height: 50,
              width: 120,
              minWidth: 134,
              display: 'flex',
              flexDirection: 'column',
              marginRight: 12,
              position: 'relative'
            }} onClick={() => this.setState({ showPage: 'allChannels'})}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <img src={AllIcon} style={{ height: 12, marginRight: 4 }} />
                <Text style={{ color: '#00673a', fontWeight: 500, whiteSpace: 'nowrap' }}>All Integrations</Text>
              </div>
              <Text style={{ color: '#00673a', fontSize: 10, whiteSpace: 'nowrap' }}>{channels && channels.entries.length} Integrations</Text>
              {showPage === 'allChannels' && <NavPointTriangle />}
            </div>

            <div style={{
              backgroundColor: '#10b48c',
              borderRadius: 6,
              padding: 10,
              cursor: 'pointer',
              height: 50,
              width: 50,
              minWidth: 50,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
              whiteSpace: 'nowrap',
              position: 'relative'
            }} onClick={() => this.setState({ showPage: 'new'})}>
              <img src={PlusIcon} style={{ height: 20 }} />
              {showPage === 'new' && <NavPointTriangle />}
            </div>
          </div>

          {
            showPage === "home" && (
              <div className="blankstateWrapper">
                <div className="message">
                <h1>Integrations</h1>

                <div className="explainer">
                  <p>More details about adding Integrations can be found <a href="https://docs.helium.com/use-the-network/console/integrations/" target="_blank"> here.</a></p>
                </div>

              </div>
            <style jsx>{`
              .message {
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
                text-align: center;
              }
              .explainer {
                padding: 20px 60px 1px 60px;
                border-radius: 20px;
                text-align: center;
                margin-top: 20px;
                box-sizing: border-box;
                border: none;
              }
              .explainer p {
                color: #565656;
                font-size: 15px;
              }
              .explainer p a {
                color: #096DD9;
              }
              h1, p  {
                color: #242425;
              }
              h1 {
                font-size: 46px;
                margin-bottom: 10px;
                font-weight: 600;
                margin-top: 10px;
              }
              p {
                font-size: 20px;
                font-weight: 300;
                margin-bottom: 10px;
              }
              `}</style>

            </div>
            )
          }
          {
            showPage === 'allChannels' && error && <Text>Data failed to load, please reload the page and try again</Text>
          }
          {
            showPage === 'allChannels' && loading && <div style={{ padding: 40 }}><SkeletonLayout /></div>
          }
          {
            showPage === 'allChannels' && !loading && (
              <ChannelIndexTable
                history={this.props.history}
                channels={channels}
                openDeleteChannelModal={this.openDeleteChannelModal}
                handleChangePage={this.handleChangePage}
              />
            )
          }
          {
            showPage === 'new' && <ChannelNew />
          }
        </div>

        <DeleteChannelModal open={showDeleteChannelModal} onClose={this.closeDeleteChannelModal} channel={channelSelected}/>

        <AddResourceButton channelCallback={() => this.setState({ showPage: 'new' })} />
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(
  withGql(ChannelIndex, PAGINATED_CHANNELS, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10 }, name: 'paginatedChannelsQuery' }))
)
