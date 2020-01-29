import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Socket } from 'phoenix'
import { isJwtExpired } from '../util/jwt.js'
import { fetchIndices } from '../actions/main'

@connect(mapStateToProps, mapDispatchToProps)
class UserOrgProvider extends Component {
  componentDidMount() {
    if (this.props.isLoggedIn && this.props.currentOrganizationId) {
      this.props.fetchIndices()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isLoggedIn, currentOrganizationId, apikey, fetchIndices } = this.props

    // if the user has just logged in...
    if (!prevProps.isLoggedIn && isLoggedIn && currentOrganizationId) {
      return fetchIndices()
    }

    // if the user has switched orgs or refreshed their api key...
    if (prevProps.apikey !== apikey && isLoggedIn) {
      return fetchIndices()
    }
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    apikey: state.auth.apikey,
    currentOrganizationId: state.auth.currentOrganizationId
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchIndices,
  }, dispatch);
}

export default UserOrgProvider
