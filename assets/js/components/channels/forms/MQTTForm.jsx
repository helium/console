import React, { Component } from 'react';
import ChannelNameForm from './ChannelNameForm'

class MQTTForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.renderStep3 = this.renderStep3.bind(this)
    this.state = {
      endpoint: "",
      topic: "",
      channelName: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  renderStep3() {
    if (this.state.endpoint.length > 0 && this.state.topic.length > 0)
      return <ChannelNameForm channelName={this.state.channelName} onInputUpdate={this.handleInputUpdate}/>
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
        {this.renderStep3()}
      </div>
    );
  }
}

export default MQTTForm;
