import React, { Component } from 'react';
import { Route, Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux';
import NoOrganization from '../dashboard/NoOrganization'

class ConsoleRoute extends Component {
  render() {
    const { path, currentOrganizationId, user } = this.props
    const Component = this.props.component

    return(
      <Route path={path} render={props => {
        if (!currentOrganizationId) {
          return <NoOrganization />
        }

        return <Component {...props} user={user}/>
      }} />
    )
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId
  }
}

export default withRouter(connect(mapStateToProps)(ConsoleRoute));
