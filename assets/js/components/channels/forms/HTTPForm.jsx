import React, { Component } from 'react';
import { Typography, Button, Input, Form, Select } from 'antd';
const { Text } = Typography
const { Option } = Select
import { Row, Col } from 'antd';

class HTTPForm extends Component {
  state = {
    method: "post",
    endpoint: "",
    headers: [
      { header: "", value: "" },
      { header: "", value: "" }
    ],
    validEndpoint: true
  }

  componentDidMount() {
    const { channel } = this.props

    if (channel && channel.endpoint) {
      const header_json = JSON.parse(channel.headers)
      const headers = Object.keys(header_json).map(key => ({ header: key, value: header_json[key] }))

      this.setState({
        method: channel.method,
        endpoint: channel.endpoint,
        headers: headers
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.channel &&
      prevProps.channel.endpoint &&
      this.props.channel &&
      this.props.channel.endpoint &&
      (prevProps.channel.endpoint + prevProps.channel.method + prevProps.channel.headers !=
      this.props.channel.endpoint + this.props.channel.method + this.props.channel.headers)
    ) {
      const { channel } = this.props
      const header_json = JSON.parse(channel.headers)
      const headers = Object.keys(header_json).map(key => ({ header: key, value: header_json[key] }))

      this.setState({
        method: channel.method,
        endpoint: channel.endpoint,
        headers: headers
      })
    }
  }

  addHeaderRow = () => {
    const newHeadersArray = [...this.state.headers, { header: "", value: "" }]
    this.setState({ headers: newHeadersArray })
  }

  removeHeaderRow = (index) => {
    const newHeadersArray = this.state.headers.slice(0, index).concat(this.state.headers.slice(index + 1))
    this.setState({ headers: newHeadersArray }, this.validateInput)
  }

  handleInputUpdate = (e) => {
    const validEndpoint = e.target.name == 'endpoint' && e.target.value.indexOf(' ') == -1

    this.setState({ [e.target.name]: e.target.value, validEndpoint }, () => this.validateInput(validEndpoint))
  }

  handleMethodUpdate = (method) => {
    this.setState({ method }, this.validateInput)
  }

  handleHttpHeaderUpdate = (e) => {
    let index, input
    [index, input] = e.target.name.split('-')

    const updatedEntry = Object.assign({}, this.state.headers[index], { [input]: e.target.value })
    const newHeadersArray = this.state.headers
    newHeadersArray[index] = updatedEntry

    this.setState({ headers: newHeadersArray }, this.validateInput)
  }

  validateInput = validInput => {
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
      }, validInput)
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
            value={this.state.method}
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
          {!this.state.validEndpoint && (
            <Text style={{ color: '#F5222D', marginTop: 8 }}>
              Endpoint URL should not have spaces
            </Text>
          )}
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

        <Button icon="plus" type="default" onClick={this.addHeaderRow} >Add</Button>
      </div>
    );
  }
}

export default HTTPForm;
