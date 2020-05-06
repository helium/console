import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createOrganization } from '../../actions/organization'
import DashboardLayout from '../common/DashboardLayout'
import { Card, Input, Button, Typography } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class NoOrganization extends Component {
  state = {
    name: "",
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { name } = this.state;

    this.props.createOrganization(name, true)
  }

  render() {
    return (
      <DashboardLayout noSideNav>
        <div style={{ marginBottom: 20 }}>
        <Text strong>You are not a member of any organizations. Create one now or request an invite from your admin.</Text>
        </div>
        <Input
          placeholder="New Organization Name"
          name="name"
          value={this.state.name}
          onChange={this.handleInputUpdate}
          style={{ marginBottom: 20, width: 220 }}
        />
        <Button
          type="primary"
          onClick={this.handleSubmit}
        >
          Create Organization
        </Button>
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createOrganization }, dispatch)
}

export default NoOrganization
