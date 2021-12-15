import React, { Component } from "react";
import withGql from "../../../graphql/withGql";
import { connect } from "react-redux";
import { ALL_LABELS } from "../../../graphql/labels";
import { Typography } from "antd";
const { Text } = Typography;

const styles = {
  labelButton: {
    fontSize: 17,
    fontWeight: 700,
    marginRight: 10,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  }
}

class MobileDeviceIndexLabelsBar extends Component {
  componentDidMount() {
    const { socket, currentOrganizationId } = this.props;

    this.channel = socket.channel("graphql:device_index_labels_bar", {});
    this.channel.join();
    this.channel.on(
      `graphql:device_index_labels_bar:${currentOrganizationId}:label_list_update`,
      (message) => {
        this.props.allLabelsQuery.refetch();
      }
    );
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  render() {
    const { loading, error, allLabels } = this.props.allLabelsQuery;
    const { pathname, push } = this.props

    if (loading) return <div />;
    if (error)
      return (
        <Text>Data failed to load, please reload the page and try again</Text>
      );

    const renderLabelBarItem = (l) => {
      return (
        <div
          key={l.id}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (pathname === "/labels/" + l.id) return
            push("/labels/" + l.id)
          }}
        >
          <Text
            style={{
              ...styles.labelButton,
              color: pathname === "/labels/" + l.id ? '#2C79EE' : '#88A8C6',
              borderBottom: pathname === "/labels/" + l.id ? '3px solid #2C79EE' : 'none'
            }}
          >
            {l.name}
          </Text>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: 'flex-start',
          paddingLeft: 15,
          paddingRight: 15,
          marginBottom: 6,
          width: '100%',
          overflowX: 'scroll',
        }}
        className="no-scroll-bar"
      >
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (pathname === '/devices') return
            push('/devices')
          }}
        >
          <Text
            style={{
              ...styles.labelButton,
              color: pathname == '/devices' ? '#2C79EE' : '#88A8C6',
              borderBottom: pathname == '/devices' ? '3px solid #2C79EE' : 'none'
            }}
          >
            All Devices
          </Text>
        </div>
        {allLabels.filter(l => "/labels/" + l.id === pathname).map(renderLabelBarItem)}
        {allLabels.filter(l => "/labels/" + l.id !== pathname).map(renderLabelBarItem)}
      </div>
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
  withGql(MobileDeviceIndexLabelsBar, ALL_LABELS, (props) => ({
    fetchPolicy: "cache-first",
    variables: {},
    name: "allLabelsQuery",
  }))
);
