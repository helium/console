import React, { useEffect } from "react";
import { bindActionCreators } from "redux";
import { Spin } from "antd";
import { ApolloProvider } from "@apollo/client";
import { history } from "./store/configureStore";
import { fetchOrganization } from "./actions/organization";
import { setupApolloClient } from "./actions/apollo";
import { getMagicSessionToken } from "./actions/magic"

// Routes
import { connect } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { Redirect } from "react-router";
import { Route, Switch } from "react-router-dom";
import JoinOrganizationPrompt from "./components/auth/JoinOrganizationPrompt.jsx";
import Profile from "./components/profile/Profile.jsx";
import DeviceIndex from "./components/devices/DeviceIndex";
import DeviceHome from "./components/devices/DeviceHome";
import DeviceShow from "./components/devices/DeviceShow";
import LabelNew from "./components/labels/LabelNew";
import LabelShow from "./components/labels/LabelShow";
import DeviceNew from "./components/devices/DeviceNew";
import ChannelIndex from "./components/channels/ChannelIndex";
import ChannelShow from "./components/channels/ChannelShow";
import ChannelNew from "./components/channels/ChannelNew";
import ChannelHome from "./components/channels/ChannelHome";
import UserIndex from "./components/organizations/UserIndex";
import OrganizationIndex from "./components/organizations/OrganizationIndex";
import DataCreditsIndex from "./components/billing/DataCreditsIndex";
import FunctionIndex from "./components/functions/FunctionIndex";
import FunctionNew from "./components/functions/FunctionNew";
import FunctionHome from "./components/functions/FunctionHome";
import FunctionShow from "./components/functions/FunctionShow";
import FlowsIndex from "./components/flows/FlowsIndex";
import AlertsIndex from "./components/alerts/AlertsIndex";
import CoverageIndex from "./components/coverage/CoverageIndex";
import MultiBuyIndex from "./components/multi_buy/MultiBuyIndex";
import NoOrganization from "./components/organizations/NoOrganization";
import Welcome from "./components/Welcome";
import ConfirmEmailPrompt from "./components/auth/ConfirmEmailPrompt";
import ConfigProfilesIndex from "./components/config_profiles/ConfigProfilesIndex";

const MagicRouter = (props) => {
  const {
    currentOrganizationId,
    loadedOrganization,
    loadingOrganization,
    fetchOrganization,
    setupApolloClient,
    apolloClient,
    user
  } = props;

  useEffect(() => {
    if (
      !currentOrganizationId &&
      !loadingOrganization &&
      !loadedOrganization
    ) {
      fetchOrganization()
      return
    } else if (!apolloClient && currentOrganizationId) {
      setupApolloClient(getMagicSessionToken, currentOrganizationId)
      return
    }
  }, [
    currentOrganizationId,
    loadingOrganization,
    loadedOrganization,
    user,
  ]);

  const redirectPath =
    localStorage.getItem("hideWelcomeScreen") === "hidden"
      ? "/flows"
      : "/welcome";

  if (loadingOrganization || (loadedOrganization && currentOrganizationId && !apolloClient)) return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
      <Spin size="large" />
    </div>
  )

  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Redirect exact from="/" to={redirectPath} />
        <Route
          path="/join_organization"
          loaded={loadedOrganization}
          component={JoinOrganizationPrompt}
        />
        <Route>
          { loadedOrganization && !currentOrganizationId && (<NoOrganization />) }
          { currentOrganizationId && apolloClient && (
            <ApolloProvider client={apolloClient}>
              <Switch>
                <Route
                  exact
                  path="/welcome"
                  component={(props) => (
                    <Welcome user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/devices"
                  component={(props) => (
                    <DeviceIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/devices/home"
                  component={(props) => (
                    <DeviceHome user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/devices/new"
                  component={(props) => (
                    <DeviceNew user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/devices/new_label"
                  component={(props) => (
                    <LabelNew user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/devices/:id"
                  component={(props) => (
                    <DeviceShow user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/labels/:id"
                  component={(props) => (
                    <LabelShow user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/integrations"
                  component={(props) => (
                    <ChannelIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/integrations/home"
                  component={(props) => (
                    <ChannelHome user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/integrations/new"
                  component={(props) => (
                    <ChannelNew user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/integrations/:id"
                  component={(props) => (
                    <ChannelShow user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/functions"
                  component={(props) => (
                    <FunctionIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/functions/new"
                  component={(props) => (
                    <FunctionNew user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/functions/home"
                  component={(props) => (
                    <FunctionHome user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/functions/:id"
                  component={(props) => (
                    <FunctionShow user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/organizations"
                  component={(props) => (
                    <OrganizationIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/users"
                  component={(props) => (
                    <UserIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/datacredits"
                  component={(props) => (
                    <DataCreditsIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/flows"
                  component={(props) => (
                    <FlowsIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/alerts"
                  component={(props) => (
                    <AlertsIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/alerts/new"
                  component={(props) => (
                    <AlertsIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/alerts/:id"
                  component={(props) => (
                    <AlertsIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/multi_buys"
                  component={(props) => (
                    <MultiBuyIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/multi_buys/new"
                  component={(props) => (
                    <MultiBuyIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/multi_buys/:id"
                  component={(props) => (
                    <MultiBuyIndex user={user} {...props} />
                  )}
                />
                <Route
                  path="/profile"
                  component={(props) => (
                    <Profile user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/coverage"
                  component={(props) => (
                    <CoverageIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/config_profiles"
                  component={(props) => (
                    <ConfigProfilesIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/config_profiles/new"
                  component={(props) => (
                    <ConfigProfilesIndex user={user} {...props} />
                  )}
                />
                <Route
                  exact
                  path="/config_profiles/:id"
                  component={(props) => (
                    <ConfigProfilesIndex user={user} {...props} />
                  )}
                />
              </Switch>
            </ApolloProvider>
          )}
        </Route>
      </Switch>
    </ConnectedRouter>
  );
};

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    loadedOrganization: state.organization.loadedOrganization,
    loadingOrganization: state.organization.loadingOrganization,
    apolloClient: state.apollo.apolloClient,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      fetchOrganization,
      setupApolloClient,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(MagicRouter);
