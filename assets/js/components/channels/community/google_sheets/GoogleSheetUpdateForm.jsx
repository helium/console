import React, { Component } from "react";
import { Typography, Input, Button } from 'antd';
const { Text } = Typography

class DatacakeUpdateForm extends Component {
  state = {
    formId: ""
  };

  componentDidMount() {
    const { endpoint } = this.props.channel
    const formId = endpoint.split('forms/d/e/')[1]
    if (formId.split('/')[1] === 'formResponse') {
      this.setState({ formId: formId.split('/')[0] })
    }
  }

  handleFormIdUpdate = (e) => {
    this.setState({ formId: e.target.value }, this.validateInput);
  };

  validateInput = () => {
    const { formId } = this.state
    this.props.onValidInput({ form_id: formId }, formId.length > 0)
  }

  render() {
    const { mobile } = this.props;
    return (
      <>
        <div>
          <Text style={{ display: "block" }}>Enter Form Id:</Text>
        </div>
        <div>
          <Input
            value={this.state.formId}
            onChange={this.handleFormIdUpdate}
            style={{ ...(!mobile && { width: "50%" }) }}
          />
        </div>
      </>
    );
  }
}

export default DatacakeUpdateForm;
