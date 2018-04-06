import React, { Component } from 'react';
import ChannelNameForm from './ChannelNameForm'

class AzureForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.renderStep3 = this.renderStep3.bind(this)
    this.state = {
      connectionString: "",
      hostName: "",
      accessKeyName: "",
      accessKey: "",
      channelName: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  renderStep3() {
    if (this.state.connectionString.length > 0)
      return <ChannelNameForm channelName={this.state.channelName} onInputUpdate={this.handleInputUpdate}/>
  }

  render() {
    return(
      <div>
        <p>Enter your Azure Connection String</p>
        <div>
          <label>Connection String</label>
          <input type="text" name="connectionString" value={this.state.connectionString} onChange={this.handleInputUpdate}/>
        </div>
        <p></p>
        <div>
          <label>Hostname</label>
          <input disabled type="text" name="hostName" value={this.state.hostName}/>
        </div>
        <div>
          <label>Shared Access Key Name</label>
          <input disabled type="text" name="accessKeyName" value={this.state.accessKeyName}/>
        </div>
        <div>
          <label>Shared Access Key</label>
          <input disabled type="text" name="accessKey" value={this.state.accessKey}/>
        </div>
        {this.renderStep3()}
      </div>
    );
  }
}

export default AzureForm;
