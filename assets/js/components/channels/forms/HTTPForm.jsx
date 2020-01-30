import React, { Component } from 'react';
import { Typography, Button, Input, Form, Select } from 'antd';
const { Text } = Typography
const { Option } = Select
import { Row, Col } from 'antd';

class HTTPForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.handleMethodUpdate = this.handleMethodUpdate.bind(this)
    this.handleHttpHeaderUpdate = this.handleHttpHeaderUpdate.bind(this)
    this.addHeaderRow = this.addHeaderRow.bind(this)
    this.removeHeaderRow = this.removeHeaderRow.bind(this)
    this.validateInput = this.validateInput.bind(this)
    this.state = {
      method: "post",
      endpoint: "",
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
    this.setState({ headers: newHeadersArray }, this.validateInput)
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, this.validateInput)
  }

  handleMethodUpdate(method) {
    this.setState({ method }, this.validateInput)
  }

  handleHttpHeaderUpdate(e) {
    let index, input
    [index, input] = e.target.name.split('-')

    const updatedEntry = Object.assign({}, this.state.headers[index], { [input]: e.target.value })
    const newHeadersArray = this.state.headers
    newHeadersArray[index] = updatedEntry

    this.setState({ headers: newHeadersArray }, this.validateInput)
  }

  validateInput() {
    const { method, endpoint, headers } = this.state
    if (method.length > 0 && endpoint.length > 0) {
      const parsedHeaders = headers.reduce((a, h) => {
        if (h.header !== "" && h.value !== "") a[h.header] = h.value
        return a
      }, {})

      this.props.onValidInput({
        method,
        endpoint,
        headers: parsedHeaders,
      })
    }
  }

  render() {
    const { type } = this.props

    return(
      <div>

        <Text>
          {type === "update" ? "Update your HTTP Connection Details" : "Enter your HTTP Connection Details"}
        </Text>

        <Row gutter={16} style={{marginBottom: 16, marginTop: 20}}>
        <Col sm={12}>
          <Select
            defaultValue={this.state.method}
            onChange={this.handleMethodUpdate}
            style={{ width: '100%'}}
          >
            <Option value="post">POST</Option>
            <Option value="get">GET</Option>
            <Option value="put">PUT</Option>
            <Option value="patch">PATCH</Option>
          </Select>
          </Col>

          <Col sm={12}>
          <Input
            placeholder="Endpoint"
            name="endpoint"
            value={this.state.endpoint}
            onChange={this.handleInputUpdate}
            style={{ width: '100%'}}
          />
          </Col>
        </Row>

        {
          this.state.headers.map((obj, i) => (
            <Row gutter={16} style={{marginBottom: 16}} key={`${i}-key`}>
            <div key={`http-${i}`} style={{ display: 'flex', flexDirection: 'row'}}>
            <Col sm={12}>
              <Input
                placeholder="HTTP Header"
                name={`${i}-header`}
                value={obj.header}
                onChange={this.handleHttpHeaderUpdate}
                style={{ width: '100%'}}
              />
              </Col>
              <Col sm={12}>
              <Input
                placeholder="Value"
                name={`${i}-value`}
                value={obj.value}
                onChange={this.handleHttpHeaderUpdate}
                style={{ width: '100%'}}
              />
              </Col>

              {
                (i > 1) &&
                  <Button
                    onClick={() => this.removeHeaderRow(i)} style={{backgroundColor: 'white', boxShadow: 'none'}}
                    icon="close"
                    shape="circle"
                  />
              }
            </div>
                          </Row>

          ))
        }

        <Button icon="plus" type="primary" onClick={this.addHeaderRow} >Add</Button>
      </div>
    );
  }
}

export default HTTPForm;
