import React, { useEffect } from "react";
import { bindActionCreators } from "redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { Spin } from "antd";
import { ApolloProvider } from "@apollo/client";
import { persistor, history } from "./store/configureStore";
import { fetchOrganization } from "./actions/organization";
import { setupApolloClient } from "./actions/apollo";
import { useAuth0 } from "./components/auth/Auth0Provider";
import { connect } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { Redirect } from "react-router";
import { Route, Switch } from "react-router-dom";
import PublicRoute from "./components/routes/PublicRoute.jsx";
import JoinOrganizationPrompt from "./components/auth/JoinOrganizationPrompt.jsx";
import NoOrganization from "./components/organizations/NoOrganization";
import ConfirmEmailPrompt from "./components/auth/ConfirmEmailPrompt";

// Lazy routes
const Welcome = React.lazy(() => import("./components/Welcome"));
const DeviceIndex = React.lazy(() =>
  import("./components/devices/DeviceIndex")
);
const DeviceHome = React.lazy(() => import("./components/devices/DeviceHome"));
const DeviceNew = React.lazy(() => import("./components/devices/DeviceNew"));
const LabelNew = React.lazy(() => import("./components/labels/LabelNew"));
const DeviceShow = React.lazy(() => import("./components/devices/DeviceShow"));
const LabelShow = React.lazy(() => import("./components/labels/LabelShow"));
const ChannelIndex = React.lazy(() =>
  import("./components/channels/ChannelIndex")
);
const ChannelHome = React.lazy(() =>
  import("./components/channels/ChannelHome")
);
const ChannelNew = React.lazy(() => import("./components/channels/ChannelNew"));
const ChannelShow = React.lazy(() =>
  import("./components/channels/ChannelShow")
);
const FunctionIndex = React.lazy(() =>
  import("./components/functions/FunctionIndex")
);
const FunctionNew = React.lazy(() =>
  import("./components/functions/FunctionNew")
);
const FunctionHome = React.lazy(() =>
  import("./components/functions/FunctionHome")
);
const FunctionShow = React.lazy(() =>
  import("./components/functions/FunctionShow")
);
const OrganizationIndex = React.lazy(() =>
  import("./components/organizations/OrganizationIndex")
);
const UserIndex = React.lazy(() =>
  import("./components/organizations/UserIndex")
);
const DataCreditsIndex = React.lazy(() =>
  import("./components/billing/DataCreditsIndex")
);
const FlowsIndex = React.lazy(() => import("./components/flows/FlowsIndex"));
const AlertsIndex = React.lazy(() => import("./components/alerts/AlertsIndex"));
const AdrIndex = React.lazy(() => import("./components/adr/AdrIndex"));
const MultiBuyIndex = React.lazy(() =>
  import("./components/multi_buy/MultiBuyIndex")
);
const Profile = React.lazy(() => import("./components/profile/Profile.jsx"));

const Router = (props) => {
  const {
    loading,
    isAuthenticated,
    loginWithRedirect,
    getIdTokenClaims,
    user,
  } = useAuth0();
  const {
    currentOrganizationId,
    loadedOrganization,
    loadingOrganization,
    fetchOrganization,
    setupApolloClient,
    apolloClient,
  } = props;
  useEffect(() => {
    if (isAuthenticated && user && user.email_verified) {
      if (
        !currentOrganizationId &&
        !loadingOrganization &&
        !loadedOrganization
      ) {
        // Only fetch organizations if we haven't loaded them and there isn't one
        fetchOrganization();
        return;
      } else if (!apolloClient && currentOrganizationId) {
        // Only set up the apollo client if there is an organization
        // and the client hasn't been setup yet
        setupApolloClient(getIdTokenClaims, currentOrganizationId);
        return;
      }
    }
    const fn = async () => {
      localStorage.removeItem("organization");
      await loginWithRedirect({
        appState: {
          targetUrl: window.location.pathname,
          params: window.location.search,
        },
      });
    };
    if (!loading && !isAuthenticated) {
      fn();
    }
  }, [
    loading,
    isAuthenticated,
    currentOrganizationId,
    loadingOrganization,
    loadedOrganization,
    user,
  ]);
  if (loading) {
    return (
      <div
        style={{
          position: "absolute",
          top: "calc(50% - 20px)",
          left: "calc(50% - 20px)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  const redirectPath =
    localStorage.getItem("hideWelcomeScreen") === "hidden"
      ? "/flows"
      : "/welcome";
  return (
    <PersistGate loading={null} persistor={persistor}>
      <React.Suspense fallback={<p>Loading...</p>}>
        {/* ConnectedRouter will use the store from Provider automatically */}
        <ConnectedRouter history={history}>
          {
            /* If the user is not verified yet, wait for them to confirm their email before continuing */
            (user && !user.email_verified && (
              <ConfirmEmailPrompt user={user} />
            )) ||
              // Verify we are authenticated before displaying other Components
              (isAuthenticated && (
                <Switch>
                  <Redirect exact from="/" to={redirectPath} />
                  <PublicRoute
                    path="/join_organization"
                    loaded={loadedOrganization}
                    component={JoinOrganizationPrompt}
                  />
                  <Route>
                    {
                      /* If user has no organizations then render the no org page */
                      (loadedOrganization && !currentOrganizationId && (
                        <NoOrganization />
                      )) ||
                        /* Otherwise if the apollo client has been instantiated, render data routes */
                        (apolloClient && (
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
                                path="/adr"
                                component={(props) => (
                                  <AdrIndex user={user} {...props} />
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
                            </Switch>
                          </ApolloProvider>
                        ))
                    }
                  </Route>
                </Switch>
              ))
          }
        </ConnectedRouter>
      </React.Suspense>
    </PersistGate>
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

export default connect(mapStateToProps, mapDispatchToProps)(Router);
