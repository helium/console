import React, { Component } from 'react';
import { Typography, Input, Button } from 'antd';
const { Text } = Typography

class CargoForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      method: "post",
      endpoint: "https://cargo.helium.com/api/payloads",
      headers: [
        { header: "Content-Type", value: "application/json" }
      ]
    }

    this.validateInput = this.validateInput.bind(this)
  }

  validateInput() {
    const { method, endpoint, headers } = this.state
    if (method.length > 0 && endpoint.length > 0) {
      const parsedHeaders = headers.reduce((a, h) => {
        if (h.header !== "" && h.value !== "") a[h.header] = h.value
        return a
      }, {})

      this.props.onValidInput({
        method,
        endpoint,
        headers: parsedHeaders,
      })
    }
  }

  render() {
    return(
      <div>
        <Text>
          You are opting to test your devices on the Helium Cargo HTTP integration endpoint.
        </Text>
        <br />
        <Text>
          Helium Cargo is an evaluation tool and the data collected is available to all developers.
        </Text>
        <br />
        <Text>
          Please do not share any sensitive information. Use as your own discretion.
        </Text>
        <br />
        <Button
          onClick={this.validateInput}
          type="default"
          style={{marginTop: 20}}
        >
          I AGREE
        </Button>
      </div>
    );
  }
}

export default CargoForm;
