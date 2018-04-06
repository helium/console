import React, { Component } from 'react';
import ChannelNameForm from './ChannelNameForm'

class HTTPForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.handleHttpHeaderUpdate = this.handleHttpHeaderUpdate.bind(this)
    this.addHeaderRow = this.addHeaderRow.bind(this)
    this.removeHeaderRow = this.removeHeaderRow.bind(this)
    this.renderStep3 = this.renderStep3.bind(this)
    this.state = {
      method: "post",
      endpoint: "",
      channelName: "",
      headers: [
        { header: "", value: "" },
        { header: "", value: "" }
      ]
    }
  }

  addHeaderRow() {
    const newHeadersArray = [...this.state.headers, { header: "", value: "" }]
    this.setState({ headers: newHeadersArray })
  }

  removeHeaderRow(index) {
    const newHeadersArray = this.state.headers.slice(0, index).concat(this.state.headers.slice(index + 1))
    this.setState({ headers: newHeadersArray })
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleHttpHeaderUpdate(e) {
    let index, input
    [index, input] = e.target.name.split('-')

    const updatedEntry = Object.assign({}, this.state.headers[index], { [input]: e.target.value })
    const newHeadersArray = this.state.headers.slice(0, index).concat(updatedEntry, this.state.headers.slice(index + 1))
    
    this.setState({ headers: newHeadersArray })
  }

  renderStep3() {
    if (this.state.method.length > 0 && this.state.endpoint.length > 0)
      return <ChannelNameForm channelName={this.state.channelName} onInputUpdate={this.handleInputUpdate}/>
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
        {
          this.state.headers.map((obj, i) => (
            <div key={i}>
              <label>HTTP Headers</label>
              <input type="text" name={`${i}-header`} value={obj.header} onChange={this.handleHttpHeaderUpdate}/>
              <input type="text" name={`${i}-value`} value={obj.value} onChange={this.handleHttpHeaderUpdate}/>
              {i > 1 && <span onClick={() => this.removeHeaderRow(i)}> x</span>}
            </div>
          ))
        }
        <h4 onClick={this.addHeaderRow}>+</h4>
        {this.renderStep3()}
      </div>
    );
  }
}

export default HTTPForm;
