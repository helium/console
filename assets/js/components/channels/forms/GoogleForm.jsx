import React, { Component } from 'react';

class GoogleForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      registryId: "",
      region: "",
      privateKey: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
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
      </div>
    );
  }
}

export default GoogleForm;
