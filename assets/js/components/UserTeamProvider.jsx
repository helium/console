import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchIndices } from '../actions/main'

@connect(mapStateToProps, mapDispatchToProps)
class UserTeamProvider extends Component {
  componentDidMount() {
    if (this.props.isLoggedIn && this.props.currentTeamId) {
      this.props.fetchIndices()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isLoggedIn, currentTeamId, apikey, fetchIndices } = this.props

    // if the user has just logged in...
    if (!prevProps.isLoggedIn && isLoggedIn && currentTeamId) {
      return fetchIndices()
    }

    // if the user has switched teams or refreshed their api key...
    if (prevProps.apikey !== apikey) {
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
    currentTeamId: state.auth.currentTeamId
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchIndices,
  }, dispatch);
}

export default UserTeamProvider
