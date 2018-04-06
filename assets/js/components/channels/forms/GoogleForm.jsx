import React, { Component } from 'react';
import ChannelNameForm from './ChannelNameForm'

class GoogleForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.renderStep3 = this.renderStep3.bind(this)
    this.state = {
      registryId: "",
      region: "",
      privateKey: "",
      channelName: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  renderStep3() {
    if (this.state.registryId.length > 0
    && this.state.region.length > 0
    && this.state.privateKey.length > 0)
      return <ChannelNameForm channelName={this.state.channelName} onInputUpdate={this.handleInputUpdate}/>
  }

  render() {
    return(
      <div>
        <p>Enter your Google Details</p>
        <div>
          <label>Registry ID</label>
          <input type="text" name="registryId" value={this.state.registryId} onChange={this.handleInputUpdate}/>
        </div>
        <div>
          <label>Region</label>
          <input type="text" name="region" value={this.state.region} onChange={this.handleInputUpdate}/>
        </div>
        <div>
          <p></p>
          <label>JSON Private Key</label>
          <textarea rows="3" name="privateKey" onChange={this.handleInputUpdate}>{this.state.privatekey}</textarea>
        </div>
        {this.renderStep3()}
      </div>
    );
  }
}

export default GoogleForm;
