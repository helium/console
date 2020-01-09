import React, { Component } from 'react';
import AuthLayout from '../common/AuthLayout'
import { Typography, Button, Input, Form } from 'antd';
const { Text } = Typography

class TwoFactorForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      twoFactorCode: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()

    this.props.onSubmit(this.state.twoFactorCode)
  }

  handleInputUpdate(e) {
    this.setState({ twoFactorCode: e.target.value})
  }

  render() {
    return(
      <AuthLayout>
        <Text strong>
          Enter Two Factor Code
        </Text>

        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            <Input
              name="twoFactorCode"
              value={this.state.twoFactorCode}
              onChange={this.handleInputUpdate}
            />
          </Form.Item>
          <Button htmlType="submit" type="primary">
            Confirm
          </Button>
        </Form>
      </AuthLayout>
    )
  }
}

export default TwoFactorForm
