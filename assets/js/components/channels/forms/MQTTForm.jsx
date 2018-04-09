import React, { Component } from 'react';

class MQTTForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      endpoint: "",
      topic: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const { endpoint, topic } = this.state
      if (endpoint.length > 0 && topic.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          endpoint,
          topic
        })
      }
    })
  }

  render() {
    return(
      <div>
        <p>Enter your MQTT Connection Details</p>
        <div>
          <label>Endpoint</label>
          <input type="text" name="endpoint" value={this.state.endpoint} onChange={this.handleInputUpdate}/>
        </div>
        <div>
          <label>Topic</label>
          <input type="text" name="topic" value={this.state.topic} onChange={this.handleInputUpdate}/>
        </div>
      </div>
    );
  }
}

export default MQTTForm;
