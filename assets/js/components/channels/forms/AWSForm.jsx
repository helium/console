import React, { Component } from 'react';
import ChannelNameForm from './ChannelNameForm'

class AWSForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.renderStep3 = this.renderStep3.bind(this)
    this.state ={
      accessKeyId: "",
      secretAccessKey: "",
      region: "",
      channelName: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  renderStep3() {
    if (this.state.accessKeyId.length > 0
    && this.state.secretAccessKey.length > 0
    && this.state.region.length > 0)
      return <ChannelNameForm channelName={this.state.channelName} onInputUpdate={this.handleInputUpdate}/>
  }

  render() {
    return(
      <div>
        <p>Enter your AWS Connection Details</p>
        <div>
          <label>Access Key ID</label>
          <input type="text" name="accessKeyId" value={this.state.accessKeyId} onChange={this.handleInputUpdate}/>
        </div>
        <div>
          <label>Secret Access Key</label>
          <input type="text" name="secretAccessKey" value={this.state.secretAccessKey} onChange={this.handleInputUpdate}/>
        </div>
        <div>
          <label>Region</label>
          <input type="text" name="region" value={this.state.region} onChange={this.handleInputUpdate}/>
        </div>
        {this.renderStep3()}
      </div>
    );
  }
}

export default AWSForm;
