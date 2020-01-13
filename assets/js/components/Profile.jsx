import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logOut } from '../actions/auth';
import DashboardLayout from './common/DashboardLayout'
import analyticsLogger from '../util/analyticsLogger'
import { Typography, Button } from 'antd';
const { Text } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class Profile extends Component {
  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_PROFILE")
  }

  render() {
    const { email } = this.props.user;
    const { logOut, apikey } = this.props

    return(
      <DashboardLayout title="Profile">
        <Text style={{ fontWeight: 'bold' }}>
          Profile Details
        </Text>
        <br />
        <Text>
          Your email is: {email}
        </Text>
        <br />
        <Text>
          Auth token: <input defaultValue={apikey} />
        </Text>
        <br />
        <Button
          type="danger"
          onClick={() => {
            analyticsLogger.logEvent("ACTION_LOGOUT", { "email": email})
            logOut()
          }}
        >
          Log Out
        </Button>
      </DashboardLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    userId: state.auth.user.id,
    apikey: state.auth.apikey
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut }, dispatch)
}

export default Profile
