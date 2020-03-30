import React, { Component } from 'react';
import { Typography, Input, Button } from 'antd';
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
          myDevices Cayenne lets you quickly visualize real-time data sent over the Helium Network.
        </Text>
        <br />
        <Text>
          Use a supported device listed on their console or encode the payload with the Cayenne Low Power Payload (Cayenne LPP) format.
        </Text>
        <br />
        <Text>
          For more integration information, check <a href="http://developer.helium.com/console/integrations" target="_blank">developer.helium.com/console/integrations</a>.
        </Text>
      </div>
    );
  }
}

export default MyDevicesForm;
