import React, { Component } from 'react';

class HTTPForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      method: "post",
      endpoint: ""
    }
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
            <select name="method" onChange={this.handleInputUpdate}>
              <option value="post">POST</option>
              <option value="get">GET</option>
              <option value="put">PUT</option>
              <option value="patch">PATCH</option>
            </select>
            <label>Endpoint</label>
            <input type="text" name="endpoint" value={this.state.endpoint} onChange={this.handleInputUpdate}/>
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
