import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import withGql from "../../graphql/withGql";
import FunctionDashboardLayout from "./FunctionDashboardLayout";
import UserCan from "../common/UserCan";
import FunctionValidator from "./FunctionValidator";
import DeleteFunctionModal from "./DeleteFunctionModal";
import GoogleSheetForm from "../channels/forms/GoogleSheetForm";
import { FUNCTION_SHOW } from "../../graphql/functions";
import { deleteFunction, updateFunction } from "../../actions/function";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from '../../util/constants'
import { Typography, Card, Button } from "antd";
import PauseOutlined from "@ant-design/icons/PauseOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import CaretRightOutlined from "@ant-design/icons/CaretRightOutlined";
import { SkeletonLayout } from "../common/SkeletonLayout";
const { Text } = Typography;
import FunctionDetailsCard from "./FunctionDetailsCard";

class FunctionShow extends Component {
  state = {
    name: "",
    type: undefined,
    format: undefined,
    body: "",
    codeUpdated: false,
    showDeleteFunctionModal: false,
  };

  componentDidMount() {
    const functionId = this.props.match.params.id;
    analyticsLogger.logEvent("ACTION_NAV_FUNCTION_SHOW", { id: functionId });

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

  handleInputUpdate = (e) => this.setState({ name: e.target.value });

  handleSelectFunctionType = () => this.setState({ type: "decoder" });

  handleSelectFormat = (format) => {
    if (format === "custom") this.setState({ format, codeUpdated: true });
    else this.setState({ format });
  };

  handleFunctionUpdate = (body) => this.setState({ body, codeUpdated: true });

  handleSubmit = () => {
    const { name, type, format, body } = this.state;
    const functionId = this.props.match.params.id;
    const fxn = this.props.functionShowQuery.function;

    const newAttrs = {};

    if (name.length > 0) newAttrs.name = name;
    if (type) newAttrs.type = type;
    if (format) newAttrs.format = format;
    if (format === "custom" || (fxn.format === "custom" && !format))
      newAttrs.body = body;
    this.props.updateFunction(functionId, newAttrs);

    analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_DETAILS", {
      id: functionId,
      attrs: newAttrs,
    });
  };

  clearInputs = () => {
    this.setState({
      name: "",
      type: undefined,
      format: undefined,
      body: "",
      codeUpdated: false,
    });
  };

  openDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: true });
  };

  closeDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: false });
  };

  render() {
    const { name, type, format, body, codeUpdated, showDeleteFunctionModal } =
      this.state;
    const { loading, error } = this.props.functionShowQuery;
    const fxn = this.props.functionShowQuery.function;

    if (loading)
      return (
        <FunctionDashboardLayout {...this.props}>
          <div style={{ padding: 40 }}>
            <SkeletonLayout />
          </div>
        </FunctionDashboardLayout>
      );
    if (error)
      return (
        <FunctionDashboardLayout {...this.props}>
          <div style={{ padding: 40 }}>
            <Text>
              Data failed to load, please reload the page and try again
            </Text>
          </div>
        </FunctionDashboardLayout>
      );

    return (
      <FunctionDashboardLayout {...this.props}>
        <div className="no-scroll-bar" style={{ overflowX: 'scroll'}}>
          <div
            style={{
              padding: "30px 30px 10px 30px",
              height: "100%",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
              minWidth
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <UserCan>
                <Button
                  style={{ borderRadius: 4, marginRight: 12 }}
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
                  {fxn.active ? "Pause" : "Start"} Function
                </Button>
                <Button
                  style={{ borderRadius: 4 }}
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.openDeleteFunctionModal();
                  }}
                >
                  Delete Function
                </Button>
              </UserCan>
            </div>

            <FunctionDetailsCard
              fxn={fxn}
              name={name}
              type={type}
              format={format}
              body={body}
              handleSelectFunctionType={this.handleSelectFunctionType}
              handleInputUpdate={this.handleInputUpdate}
              handleSelectFormat={this.handleSelectFormat}
              clearInputs={this.clearInputs}
              handleSubmit={this.handleSubmit}
              horizontal={true}
            />

            <UserCan>
              {fxn.format === "custom" && fxn.body.indexOf("Google Form") !== -1 && (
                <Card title="Google Form Fields">
                  <GoogleSheetForm />
                </Card>
              )}
            </UserCan>

            {(format === "custom" || (fxn.format === "custom" && !format)) && (
              <FunctionValidator
                handleFunctionUpdate={this.handleFunctionUpdate}
                body={body === "" && !codeUpdated ? fxn.body : body}
                title="Custom Script"
              />
            )}

            <DeleteFunctionModal
              open={showDeleteFunctionModal}
              onClose={this.closeDeleteFunctionModal}
              functionToDelete={fxn}
              redirect
            />
          </div>
        </div>
      </FunctionDashboardLayout>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteFunction, updateFunction }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(FunctionShow, FUNCTION_SHOW, (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.match.params.id },
    name: "functionShowQuery",
  }))
);
