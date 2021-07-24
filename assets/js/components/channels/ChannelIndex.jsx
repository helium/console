import React, { Component } from "react";
import { connect } from "react-redux";
import withGql from "../../graphql/withGql";
import ChannelIndexTable from "./ChannelIndexTable";
import ChannelDashboardLayout from "./ChannelDashboardLayout";
import DeleteChannelModal from "./DeleteChannelModal";
import analyticsLogger from "../../util/analyticsLogger";
import { PAGINATED_CHANNELS } from "../../graphql/channels";
import { SkeletonLayout } from "../common/SkeletonLayout";
import { Typography } from "antd";
const { Text } = Typography;

class ChannelIndex extends Component {
  state = {
    channelSelected: null,
    page: 1,
    pageSize: 10,
    showDeleteChannelModal: false,
  };

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props;
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_INDEX");

    this.channel = socket.channel("graphql:channels_index_table", {});
    this.channel.join();
    this.channel.on(
      `graphql:channels_index_table:${currentOrganizationId}:channel_list_update`,
      (message) => {
        this.refetchPaginatedEntries(this.state.page, this.state.pageSize);
      }
    );

    this.devicesInFlowsChannel = socket.channel("graphql:flows_update", {});
    this.devicesInFlowsChannel.join();
    this.devicesInFlowsChannel.on(
      `graphql:flows_update:${this.props.currentOrganizationId}:organization_flows_update`,
      (_message) => {
        this.refetchPaginatedEntries(this.state.page, this.state.pageSize);
      }
    );

    this.devicesInLabelsChannel = socket.channel(
      "graphql:devices_in_labels_update",
      {}
    );
    this.devicesInLabelsChannel.join();
    this.devicesInLabelsChannel.on(
      `graphql:devices_in_labels_update:${this.props.currentOrganizationId}:organization_devices_in_labels_update`,
      (_message) => {
        this.refetchPaginatedEntries(this.state.page, this.state.pageSize);
      }
    );

    if (!this.props.paginatedChannelsQuery.loading) {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize);
    }
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { refetch } = this.props.paginatedChannelsQuery;
    refetch({ page, pageSize });
  };

  handleChangePage = (page) => {
    this.setState({ page });

    const { pageSize } = this.state;
    this.refetchPaginatedEntries(page, pageSize);
  };

  openDeleteChannelModal = (channelSelected) => {
    this.setState({ showDeleteChannelModal: true, channelSelected });
  };

  closeDeleteChannelModal = () => {
    this.setState({ showDeleteChannelModal: false });
  };

  render() {
    const { channels, loading, error } = this.props.paginatedChannelsQuery;
    const { showDeleteChannelModal, channelSelected } = this.state;

    return (
      <ChannelDashboardLayout {...this.props}>
        {error && (
          <Text>Data failed to load, please reload the page and try again</Text>
        )}
        {loading && (
          <div style={{ padding: 40 }}>
            <SkeletonLayout />
          </div>
        )}
        {!loading && (
          <ChannelIndexTable
            history={this.props.history}
            channels={channels}
            openDeleteChannelModal={this.openDeleteChannelModal}
            handleChangePage={this.handleChangePage}
          />
        )}

        <DeleteChannelModal
          open={showDeleteChannelModal}
          onClose={this.closeDeleteChannelModal}
          channel={channelSelected}
        />
      </ChannelDashboardLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  };
}

export default connect(
  mapStateToProps,
  null
)(
  withGql(ChannelIndex, PAGINATED_CHANNELS, (props) => ({
    fetchPolicy: "cache-first",
    variables: { page: 1, pageSize: 10 },
    name: "paginatedChannelsQuery",
  }))
);
