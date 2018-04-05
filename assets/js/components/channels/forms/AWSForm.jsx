import React, { Component } from 'react';

class AWSForm extends Component {
  constructor(props) {
    super(props);

  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  render() {
    return(
      <div>
        <p>Enter your AWS Connection Details</p>
        <div>
          <label>Access Key ID</label>
          <input type="text" name=""/>
        </div>
        <div>
          <label>Secret Access Key</label>
          <input type="text" name=""/>
        </div>
        <div>
          <label>Region</label>
          <input type="text" name=""/>
        </div>
      </div>
    );
  }
}

export default AWSForm;
