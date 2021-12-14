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
    const { pathname } = this.props.history.location

    if (loading) return <div />;
    if (error)
      return (
        <Text>Data failed to load, please reload the page and try again</Text>
      );

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
            this.props.history.push('/devices')
          }}
        >
          <Text style={{ ...styles.labelButton, color: pathname == '/devices' ? '#2C79EE' : '#88A8C6', borderBottom: '3px solid #2C79EE' }}>All Devices</Text>
        </div>
        {allLabels.map((l) => {
          return (
            <div
              key={l.id}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (pathname === "/labels/" + l.id) return
                this.props.history.push("/labels/" + l.id)
              }}
            >
              <Text style={{ ...styles.labelButton, color: '#88A8C6' }}>{l.name}</Text>
            </div>
          );
        })}
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
