import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';

import { persistor, history } from './store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { Spin } from 'antd';
import { ApolloProvider } from '@apollo/client';

// Routes
import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import PublicRoute from './components/routes/PublicRoute.jsx';
import JoinOrganizationPrompt from './components/auth/JoinOrganizationPrompt.jsx';
import Profile from './components/profile/Profile.jsx';
// import DeviceIndex from './components/devices/DeviceIndex';
// import DeviceShow from './components/devices/DeviceShow';
import ChannelIndex from './components/channels/ChannelIndex';
import ChannelShow from './components/channels/ChannelShow';
import ChannelNew from './components/channels/ChannelNew';
import UserIndex from './components/organizations/UserIndex';
import OrganizationIndex from './components/organizations/OrganizationIndex';
// import LabelIndex from './components/labels/LabelIndex';
// import LabelShow from './components/labels/LabelShow';
import DataCreditsIndex from './components/billing/DataCreditsIndex';
import { useAuth0  } from './components/auth/Auth0Provider';
import FunctionIndex from './components/functions/FunctionIndex';
import FunctionNew from './components/functions/FunctionNew';
import FunctionShow from './components/functions/FunctionShow';
import FlowsIndex from './components/flows/FlowsIndex';
import NoOrganization from './components/organizations/NoOrganization';
import Welcome from './components/Welcome';
import { fetchOrganization } from './actions/organization';
import { setupApolloClient } from './actions/apollo';
import ConfirmEmailPrompt from './components/auth/ConfirmEmailPrompt';

const Router = (props) => {
  const {
    loading,
    isAuthenticated,
    loginWithRedirect,
    getIdTokenClaims,
    user
  } = useAuth0();
  const {
    currentOrganizationId,
    loadedOrganization,
    loadingOrganization,
    fetchOrganization,
    setupApolloClient,
    apolloClient
  } = props;
  useEffect(() => {
    if (isAuthenticated && user && user.email_verified) {
      if (!currentOrganizationId && !loadingOrganization && !loadedOrganization) {
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
      localStorage.removeItem('organization');
      await loginWithRedirect({
        appState: {targetUrl: window.location.pathname, params: window.location.search}
      });
    };
    if (!loading && !isAuthenticated) {
      fn();
    }
  }, [loading, isAuthenticated, currentOrganizationId, loadingOrganization, loadedOrganization, user]);
  if (loading) {
    return <div style={{position: 'absolute', top: 'calc(50% - 20px)', left: 'calc(50% - 20px)'}}><Spin size="large" /></div>
  }
  const redirectPath = localStorage.getItem('hideWelcomeScreen') === 'hidden' ? '/devices' : '/welcome';
  return (
    <PersistGate loading={null} persistor={persistor}>
      { /* ConnectedRouter will use the store from Provider automatically */ }
      <ConnectedRouter history={history}>
        {
          /* If the user is not verified yet, wait for them to confirm their email before continuing */
          (user && !user.email_verified && <ConfirmEmailPrompt user={user} />) ||
          (
            // Verify we are authenticated before displaying other Components
            isAuthenticated &&
            <Switch>
              <Redirect exact from="/" to={redirectPath} />
              <PublicRoute path="/join_organization" loaded={loadedOrganization} component={JoinOrganizationPrompt} />
              <Route>
                { /* If user has no organizations then render the no org page */
                  (loadedOrganization && !currentOrganizationId && <NoOrganization/>) ||
                  (
                    /* Otherwise if the apollo client has been instantiated, render data routes */
                    apolloClient &&
                    <ApolloProvider client={apolloClient}>
                      <Switch>
                        <Route exact path="/welcome" component={props => <Welcome user={user} {...props}/>} />
                        <Route exact path="/integrations" component={props => <ChannelIndex user={user} {...props}/>} />
                        <Route exact path="/integrations/new/:id?" component={props => <ChannelNew user={user} {...props}/>} />
                        <Route exact path="/integrations/:id" component={props => <ChannelShow user={user} {...props}/>} />
                        <Route exact path="/functions" component={props => <FunctionIndex user={user} {...props}/>} />
                        <Route exact path="/functions/new" component={props => <FunctionNew user={user} {...props}/>} />
                        <Route exact path="/functions/:id" component={props => <FunctionShow user={user} {...props}/>} />
                        <Route exact path="/organizations" component={props => <OrganizationIndex user={user} {...props}/>} />
                        <Route exact path="/users" component={props => <UserIndex user={user} {...props}/>}/>
                        <Route exact path="/datacredits" component={props => <DataCreditsIndex user={user} {...props}/>} />
                        <Route exact path="/flows" component={props => <FlowsIndex user={user} {...props}/>} />
                        <Route path="/profile" component={props => <Profile user={user} {...props}/>}/>
                      </Switch>
                    </ApolloProvider>
                  )
                }
              </Route>
            </Switch>
          )
        }
      </ConnectedRouter>
    </PersistGate>
  )
}


function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    loadedOrganization: state.organization.loadedOrganization,
    loadingOrganization: state.organization.loadingOrganization,
    apolloClient: state.apollo.apolloClient
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchOrganization,
    setupApolloClient
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Router)
