import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import withGql from "../../../graphql/withGql";
import PauseOutlined from "@ant-design/icons/PauseOutlined";
import CaretRightOutlined from "@ant-design/icons/CaretRightOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import { Button, Typography, Tabs, Card, Tooltip } from "antd";
const { Text, Paragraph } = Typography;
import UserCan, { userCan } from "../../common/UserCan";
import { FUNCTION_SHOW } from "../../../graphql/functions";
import { updateFunction } from "../../../actions/function";
import DeleteFunctionModal from "../../functions/DeleteFunctionModal";
import analyticsLogger from "../../../util/analyticsLogger";
import moment from "moment";
import { Link } from "react-router-dom";
const { TabPane } = Tabs;
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { functionTypes, functionFormats } from "../../functions/constants";
import ErrorMessage from "../../common/ErrorMessage";

class FunctionContent extends Component {
  state = {
    showDeleteFunctionModal: false,
  };

  componentDidMount() {
    const functionId = this.props.id;
    analyticsLogger.logEvent("ACTION_OPEN_FUNCTION_NODE_SIDE_PANEL", {
      id: functionId,
    });

    const { socket } = this.props;

    this.channel = socket.channel("graphql:function_show", {});
    this.channel.join();
    this.channel.on(
      `graphql:function_show:${functionId}:function_update`,
      (message) => {
        this.props.functionShowQuery.refetch();
      }
    );
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  openDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: true });
  };

  closeDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: false });
  };

  render() {
    const { showDeleteFunctionModal } = this.state;
    const { loading, error } = this.props.functionShowQuery;
    const fxn = this.props.functionShowQuery.function;

    if (loading)
      return (
        <div style={{ padding: 40 }}>
          <SkeletonLayout />
        </div>
      );
    if (error) return <ErrorMessage />;

    return (
      <div>
        <div style={{ padding: "40px 40px 0px 40px" }}>
          <Text style={{ fontSize: 30, fontWeight: "bold", display: "block" }}>
            {fxn.name}
          </Text>
          <Text style={{ fontWeight: "bold" }}>Last Modified: </Text>
          <Text>{moment.utc(fxn.updated_at).local().format("l LT")}</Text>
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <UserCan>
              <Button
                style={{ borderRadius: 4, marginRight: 5 }}
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  this.props.onNodeDelete();
                }}
              >
                Remove Node
              </Button>
            </UserCan>
            <UserCan>
              <Button
                style={{ borderRadius: 4, marginRight: 5 }}
                type="default"
                icon={fxn.active ? <PauseOutlined /> : <CaretRightOutlined />}
                onClick={() => {
                  this.props.updateFunction(fxn.id, { active: !fxn.active });
                  analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_ACTIVE", {
                    id: fxn.id,
                    active: !fxn.active,
                  });
                }}
              >
                {fxn.active ? "Pause" : "Start"}
              </Button>
            </UserCan>
            <Link to={`/functions/${this.props.id}`}>
              <Button
                style={{ borderRadius: 4, marginRight: 5 }}
                icon={
                  userCan({ role: this.props.currentRole }) ? (
                    <EditOutlined />
                  ) : (
                    <EyeOutlined />
                  )
                }
              >
                {userCan({ role: this.props.currentRole }) ? "Edit" : "View"}
              </Button>
            </Link>
            <UserCan>
              {this.props.hasChanges ? (
                <Tooltip
                  title="Undo or save your workspace changes before deleting this function"
                  overlayStyle={{ width: 230 }}
                >
                  <Button
                    style={{ borderRadius: 4, marginRight: 5 }}
                    type="danger"
                    icon={<DeleteOutlined />}
                    disabled
                  >
                    Delete
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  style={{ borderRadius: 4, marginRight: 5 }}
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.openDeleteFunctionModal();
                  }}
                >
                  Delete
                </Button>
              )}
            </UserCan>
          </div>
        </div>

        <Tabs defaultActiveKey="1" tabBarStyle={{ paddingLeft: 40 }}>
          <TabPane
            tab="Overview"
            key="1"
            style={{ padding: "0px 40px 0px 40px" }}
          >
            <Card title="Function Details">
              <Fragment>
                <Paragraph>
                  <Text strong>Name: </Text>
                  <Text>{fxn.name}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>Type: </Text>
                  <Text>{functionTypes[fxn.type]}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>Format: </Text>
                  <Text>{functionFormats[fxn.format]}</Text>
                </Paragraph>
              </Fragment>
            </Card>
          </TabPane>
        </Tabs>

        <DeleteFunctionModal
          open={showDeleteFunctionModal}
          onClose={this.closeDeleteFunctionModal}
          functionToDelete={fxn}
          doNotRedirect
          deleteResource={this.props.deleteResource}
        />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
    currentRole: state.organization.currentRole,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateFunction }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(FunctionContent, FUNCTION_SHOW, (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.id },
    name: "functionShowQuery",
  }))
);
