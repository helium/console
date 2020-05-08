import React, { useEffect } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchIndices } from '../actions/main'
import { fetchOrganization } from '../actions/organization'

const UserOrgProvider = (props) => {
  useEffect(() => {
    props.fetchOrganization();
  }, []);
  const location = useLocation();
  const { loadingOrganization } = props;
  if (location.pathname == '/register' || !loadingOrganization) {
    return (
      <div>
        { props.children }
      </div>
    )
  }
  return null;
}

function mapStateToProps(state, ownProps) {
  return {
    loadingOrganization: state.organization.loadingOrganization
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchIndices,
    fetchOrganization
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserOrgProvider)
