import React, { Component } from 'react';

class AzureForm extends Component {
  constructor(props) {
    super(props);

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
          <input type="text" name=""/>
        </div>
        <p></p>
        <div>
          <label>Hostname</label>
          <input type="text" name=""/>
        </div>
        <div>
          <label>Shared Access Key Name</label>
          <input type="text" name=""/>
        </div>
        <div>
          <label>Shared Access Key</label>
          <input type="text" name=""/>
        </div>
      </div>
    );
  }
}

export default AzureForm;
