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
import TableHeader from '../common/TableHeader';
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
        <TableHeader
          backgroundColor='#0dc699'
          goHome={() => { this.setState({ showPage: 'home'})}}
          otherColor='#10b48c'
          homeIcon={HomeIcon}
          goToAll={() => { this.setState({ showPage: 'allChannels' })}}
          allIcon={AllIcon}
          textColor='#00673a'
          allText='All Integrations'
          allSubtext={`${(channels && channels.entries.length)} Integrations`} // TODO fix undefined
          onHomePage={showPage === 'home'}
          onAllPage={showPage === 'allChannels'}
          onNewPage={showPage === 'new'}
          addIcon={PlusIcon}
          goToNew={() => { this.setState({ showPage: 'new' })}}
          allButtonStyles={{ width: 134, minWidth: 134 }}
        >
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
        </TableHeader>

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
