import React, { Component } from 'react';

class GoogleForm extends Component {
  constructor(props) {
    super(props);

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
          <input type="text" name=""/>
        </div>
        <div>
          <label>Region</label>
          <input type="text" name=""/>
        </div>
        <div>
          <p></p>
          <label>JSON Private Key</label>
          <input type="text" name=""/>
        </div>
      </div>
    );
  }
}

export default GoogleForm;
