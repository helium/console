import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { changePassword } from '../../actions/auth.js';
import AuthLayout from '../common/AuthLayout'
import { Typography, Button, Input, Form } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      password: "",
      passwordConfirm: ""
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { password, passwordConfirm } = this.state;
    const token = this.props.match.params.token

    this.props.changePassword(password, passwordConfirm, token);
  }

  render() {
    const { classes } = this.props

    return(
      <AuthLayout>
        <Text strong>
          Reset your password
        </Text>

        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            <Input
              placeholder="New password"
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handleInputUpdate}
            />
          </Form.Item>

          <Form.Item>
            <Input
              placeholder="Confirm Password"
              type="password"
              name="passwordConfirm"
              value={this.state.passwordConfirm}
              onChange={this.handleInputUpdate}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <br />
          <Text>
            <Link to="/login">Back to Login</Link>
          </Text>
        </Form>
      </AuthLayout>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ changePassword }, dispatch);
}

export default ResetPassword
