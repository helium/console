import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';

import { persistor, history } from './store/configureStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

import { ApolloProvider } from 'react-apollo';

// Routes
import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { Redirect } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import PublicRoute from './components/routes/PublicRoute.jsx';
import Register from './components/auth/Register.jsx';
import Profile from './components/profile/Profile.jsx';
import DeviceIndex from './components/devices/DeviceIndex';
import DeviceShow from './components/devices/DeviceShow';
import ChannelIndex from './components/channels/ChannelIndex';
import ChannelShow from './components/channels/ChannelShow';
import ChannelNew from './components/channels/ChannelNew';
import UserIndex from './components/organizations/UserIndex';
import OrganizationIndex from './components/organizations/OrganizationIndex';
import LabelIndex from './components/labels/LabelIndex';
import LabelShow from './components/labels/LabelShow';
import DataCredits from './components/billing/DataCredits';
import { useAuth0  } from './components/auth/Auth0Provider';
import FunctionIndex from './components/functions/FunctionIndex';
import FunctionNew from './components/functions/FunctionNew';
import FunctionShow from './components/functions/FunctionShow';
import NoOrganization from './components/organizations/NoOrganization';
import Welcome from './components/Welcome';
import { fetchOrganization } from './actions/organization';
import { setupApolloClient } from './actions/apollo';

const Router = (props) => {
  const { loading, isAuthenticated, loginWithRedirect, getIdTokenClaims, user } = useAuth0();
  const { currentOrganizationId, fetchOrganization, setupApolloClient, apolloClient, loadedOrganization } = props;
  useEffect(() => {
    if (isAuthenticated) {
      if (!currentOrganizationId) {
        fetchOrganization();
        return;
      } else if (!apolloClient) {
        setupApolloClient(getIdTokenClaims, currentOrganizationId);
        return;
      }
    }
    const fn = async () => {
      await loginWithRedirect({
        appState: {targetUrl: window.location.pathname, params: window.location.search}
      });
    };
    if (!loading) {
      fn();
    }
  }, [loading, isAuthenticated, loginWithRedirect, currentOrganizationId]);
  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <PersistGate loading={null} persistor={persistor}>
      { /* ConnectedRouter will use the store from Provider automatically */ }
      <ConnectedRouter history={history}>
        <Switch>
          <Redirect exact from="/" to="/devices" />
          <PublicRoute path="/register" component={Register}/>
          <Route>
            { /* If user has no organizations then render the no org page */
              (loadedOrganization && !currentOrganizationId && <NoOrganization/>) || 
              (
                /* Otherwise if the apollo client has been instantiated, render data routes */
                apolloClient && 
                <ApolloProvider client={apolloClient}>
                  <Switch>
                    <Route path="/profile" render={() => <Profile user={user}/>}/>
                    <Route exact path="/devices" component={DeviceIndex} />
                    <Route exact path="/labels" component={LabelIndex} />
                    <Route path="/devices/:id" component={DeviceShow}/>
                    <Route path="/labels/:id" component={LabelShow} />
                    <Route exact path="/integrations" component={ChannelIndex} />
                    <Route exact path="/integrations/new/:id?" component={ChannelNew} />
                    <Route exact path="/integrations/:id" component={ChannelShow} />
                    <Route exact path="/users" render={() => <UserIndex user={user}/>}/>
                    <Route exact path="/organizations" component={OrganizationIndex} />
                    <Route exact path="/datacredits" component={DataCredits} />
                    <Route exact path="/functions" component={FunctionIndex} />
                    <Route exact path="/functions/new" component={FunctionNew} />
                    <Route exact path="/functions/:id" component={FunctionShow} />
                    <Route exact path="/welcome" component={Welcome} />
                  </Switch>
                </ApolloProvider>
              )
            }
            
          </Route>
        </Switch>
      </ConnectedRouter>
    </PersistGate>
  )
}


function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    loadedOrganization: state.organization.loadedOrganization,
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
