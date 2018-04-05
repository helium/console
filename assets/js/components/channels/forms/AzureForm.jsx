import React, { Component } from 'react';

class AzureForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      connectionString: "",
      hostName: "",
      accessKeyName: "",
      accessKey: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
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
          <input type="text" name="hostName" value={this.state.hostName}/>
        </div>
        <div>
          <label>Shared Access Key Name</label>
          <input type="text" name="accessKeyName" value={this.state.accessKeyName}/>
        </div>
        <div>
          <label>Shared Access Key</label>
          <input type="text" name="accessKey" value={this.state.accessKey}/>
        </div>
      </div>
    );
  }
}

export default AzureForm;
