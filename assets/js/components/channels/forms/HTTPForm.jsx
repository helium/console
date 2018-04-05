import React, { Component } from 'react';

class HTTPForm extends Component {
  constructor(props) {
    super(props);

  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  render() {
    return(
      <div>
        <p>Enter your HTTP Connection Details</p>
          <div>
            <label>Method</label>
            <input type="text" name=""/>
            <label>Endpoint</label>
            <input type="text" name=""/>
          </div>
          <div>
            <label>HTTP Headers</label>
            <input type="text" name=""/>
            <input type="text" name=""/>
          </div>
      </div>
    );
  }
}

export default HTTPForm;
