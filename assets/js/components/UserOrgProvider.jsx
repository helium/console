import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { isJwtExpired } from '../util/jwt.js'
import { fetchIndices } from '../actions/main'
import { fetchOrganization } from '../actions/organization'

@connect(mapStateToProps, mapDispatchToProps)
class UserOrgProvider extends Component {
  componentDidMount() {
    this.props.fetchOrganization();
  }

  render() {
    const { currentOrganizationId } = this.props;
    if (window.location.pathname == '/register' || currentOrganizationId) {
      return (
        <div>
          {this.props.children}
        </div>
      )
    }
    return null;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    apikey: state.auth.apikey,
    currentOrganizationId: state.organization.currentOrganizationId
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchIndices,
    fetchOrganization
  }, dispatch);
}

export default UserOrgProvider
