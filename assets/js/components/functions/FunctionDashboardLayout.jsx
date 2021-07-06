import React, { Component } from "react";
import DashboardLayout from "../common/DashboardLayout";
import { connect } from "react-redux";
import withGql from "../../graphql/withGql";
import { ALL_FUNCTIONS } from "../../graphql/functions";
import FunctionBar from "./FunctionBar";
import HomeIcon from "../../../img/functions/function-index-home-icon.svg";
import PlusIcon from "../../../img/functions/function-index-plus-icon.svg";
import AllIcon from "../../../img/functions/function-index-all-icon.svg";
import TableHeader from "../common/TableHeader";

class FunctionDashboardLayout extends Component {
  componentDidMount() {
    const { socket, currentOrganizationId } = this.props;

    this.channel = socket.channel("graphql:function_index_bar", {});
    this.channel.join();
    this.channel.on(
      `graphql:function_index_bar:${currentOrganizationId}:function_list_update`,
      (message) => {
        const { refetch } = this.props.allFunctionsQuery;
        refetch();
      }
    );

    if (!this.props.allFunctionsQuery.loading) {
      const { refetch } = this.props.allFunctionsQuery;
      refetch();
    }
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  render() {
    const { allFunctions, loading, error } = this.props.allFunctionsQuery;
    return (
      <DashboardLayout title="My Functions" user={this.props.user}>
        <TableHeader
          backgroundColor="#DCD3EE"
          goHome={() => this.props.history.push("/functions/home")}
          otherColor="#B39FDA"
          homeIcon={HomeIcon}
          goToAll={() => this.props.history.push("/functions")}
          allIcon={AllIcon}
          textColor="#8261C2"
          allText="All Functions"
          allSubtext={allFunctions && allFunctions.length + " Functions"}
          onHomePage={
            this.props.history.location.pathname === "/functions/home"
          }
          onAllPage={this.props.history.location.pathname === "/functions"}
          onNewPage={this.props.history.location.pathname === "/functions/new"}
          addIcon={PlusIcon}
          goToNew={() => this.props.history.push("/functions/new")}
          allButtonStyles={{ width: 120, minWidth: 120 }}
          extraContent={
            allFunctions && (
              <FunctionBar
                shownFunctionId={this.props.match.params.id}
                functions={allFunctions || []}
              />
            )
          }
          newText="Add New Function"
        >
          {this.props.children}
        </TableHeader>
      </DashboardLayout>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  };
}

export default connect(
  mapStateToProps,
  null
)(
  withGql(FunctionDashboardLayout, ALL_FUNCTIONS, (props) => ({
    fetchPolicy: "cache-first",
    name: "allFunctionsQuery",
  }))
);
