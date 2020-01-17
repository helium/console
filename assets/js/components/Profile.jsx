import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logOut } from '../actions/auth';
import DashboardLayout from './common/DashboardLayout'
import analyticsLogger from '../util/analyticsLogger'
import { Typography, Button, Card, Descriptions, Divider } from 'antd';
const { Text, Title, Paragraph } = Typography

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
       <Card title="Profile Details">
       <Descriptions bordered column={4}>
       <Descriptions.Item span ={4} label="Your Email is">{email}</Descriptions.Item>
       <Descriptions.Item span ={4}  label="Auth token: "><Text copyable>{apikey}</Text></Descriptions.Item>
        </Descriptions>
       <Divider />
        <Button
          type="danger"
          onClick={() => {
            analyticsLogger.logEvent("ACTION_LOGOUT", { "email": email})
            logOut()
          }}
        >
          Log Out
        </Button>
        </Card>
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
