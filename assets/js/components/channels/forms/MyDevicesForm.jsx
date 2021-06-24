import React, { Component } from 'react';
import { Typography } from 'antd';
const { Text } = Typography

class MyDevicesForm extends Component {
  state = {
    method: "post",
    endpoint: "https://lora.mydevices.com/v1/networks/helium/uplink",
    headers: []
  }

  componentDidMount = () => {
    this.validateInput()
  }

  validateInput = () => {
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
          Use a supported device listed on their console or encode the payload with the Cayenne Low Power Payload (Cayenne LPP) format.
        </Text>
      </div>
    );
  }
}

export default MyDevicesForm;
