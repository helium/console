import React, { Component } from 'react';

class MQTTForm extends Component {
  constructor(props) {
    super(props);

  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  render() {
    return(
      <div>
        <p>Enter your MQTT Connection Details</p>
        <div>
          <label>Endpoint</label>
          <input type="text" name=""/>
        </div>
        <div>
          <label>Topic</label>
          <input type="text" name=""/>
        </div>
      </div>
    );
  }
}

export default MQTTForm;
