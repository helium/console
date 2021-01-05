import React, { Component } from 'react';
import { Typography, Button, Input, Radio, Tooltip } from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
const { Text } = Typography
import { Row, Col } from 'antd';

class HTTPForm extends Component {
  state = {
    method: "post",
    endpoint: "",
    headers: [{ header: '', value: '' }],
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

  handleMethodUpdate = e => {
    this.setState({ method: e.target.value }, this.validateInput)
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
    const METHOD_TYPES = [
      { label: 'POST', value: 'post'},
      { label: 'GET', value: 'get'},
      { label: 'PUT', value: 'put'},
      { label: 'PATCH', value: 'patch'}
    ];

    return(
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col sm={12}>
            <Radio.Group
              defaultValue="post"
              onChange={this.handleMethodUpdate}
              value={this.state.method}
              buttonStyle="solid"
              style={{ paddingTop: '10px' }}
            >
              {METHOD_TYPES.map(method => (
                <Radio.Button key={`radio_${method.value}`} value={method.value}>{method.label}</Radio.Button>
              ))}
            </Radio.Group>
          </Col>
          <Col sm={12}>
            <Text strong style={{ marginTop: '50px'}}>Endpoint URL (Required)</Text><br/>
            <Input
              placeholder="Endpoint URL"
              name="endpoint"
              value={this.state.endpoint}
              onChange={this.handleInputUpdate}
              style={{ width: '100%'}}
              suffix={
                <Tooltip title="The URL should start with either 'http://' or 'https://' and contain no spaces">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
            {!this.state.validEndpoint && (
              <Text style={{ color: '#F5222D', marginTop: 8 }}>
                Endpoint URL should not have spaces
              </Text>
            )}
          </Col>
         </Row>
        <div style={{ background: '#E6F7FF', borderRadius: "10px", padding: 20 }}>
          <Text strong>HTTP Headers (Optional)</Text>
        <br/>
        {
          this.state.headers.map((obj, i) => (
            <Row gutter={16} style={{marginBottom: 16}} key={`${i}-key`}>
              <div key={`http-${i}`} style={{ display: 'flex', flexDirection: 'row'}}>
                <Col sm={12}>
                  <Input
                    placeholder="Key"
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
              </div>
            </Row>
          ))
        }
        <Row>
          <Button style={{ borderColor: '#40A9FF', background: 'none', color: '#096DD9' }} icon={<PlusOutlined />} type="default" onClick={this.addHeaderRow} >Add Header</Button>
        </Row>
      </div>
    </div>
    );
  }
}

export default HTTPForm;
