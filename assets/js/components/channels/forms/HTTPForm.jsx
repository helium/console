import React, { Component } from "react";
import { Typography, Button, Input, Radio, Tooltip } from "antd";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
const { Text } = Typography;
import { Row, Col } from "antd";

class HTTPForm extends Component {
  state = {
    method: "post",
    endpoint: "",
    headers: [{ header: "", value: "" }],
    url_params: [],
    validEndpoint: true,
    validUrlParam: true,
  };

  componentDidMount() {
    const { channel } = this.props;

    if (channel && channel.endpoint) {
      const header_json = JSON.parse(channel.headers);
      const headers =
        header_json &&
        Object.keys(header_json).map((key) => ({
          header: key,
          value: header_json[key],
        }));

      const url_params_json =
        channel.url_params === "null" ? [] : JSON.parse(channel.url_params);
      const url_params = Object.keys(url_params_json).map((key) => ({
        key: key,
        value: url_params_json[key],
      }));

      this.setState({
        method: channel.method,
        endpoint: channel.endpoint,
        ...(headers && { headers }),
        url_params,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.channel &&
      prevProps.channel.endpoint &&
      this.props.channel &&
      this.props.channel.endpoint &&
      prevProps.channel.endpoint +
        prevProps.channel.method +
        prevProps.channel.headers !=
        this.props.channel.endpoint +
          this.props.channel.method +
          this.props.channel.headers
    ) {
      const { channel } = this.props;
      const header_json = JSON.parse(channel.headers);
      const headers = Object.keys(header_json).map((key) => ({
        header: key,
        value: header_json[key],
      }));

      this.setState({
        method: channel.method,
        endpoint: channel.endpoint,
        headers: headers,
      });
    }
  }

  addHeaderRow = () => {
    const newHeadersArray = [...this.state.headers, { header: "", value: "" }];
    this.setState({ headers: newHeadersArray });
  };

  addUrlParamRow = () => {
    const newParamsArray = [...this.state.url_params, { key: "", value: "" }];
    this.setState({ url_params: newParamsArray });
  };

  removeHeaderRow = (index) => {
    const newHeadersArray = this.state.headers
      .slice(0, index)
      .concat(this.state.headers.slice(index + 1));
    this.setState({ headers: newHeadersArray }, this.validateInput);
  };

  handleInputUpdate = (e) => {
    const validEndpoint =
      e.target.name == "endpoint" &&
      e.target.value.indexOf(" ") == -1 &&
      e.target.value.indexOf("{") == -1 &&
      e.target.value.indexOf("}") == -1;

    this.setState({ [e.target.name]: e.target.value, validEndpoint }, () =>
      this.validateInput(validEndpoint)
    );
  };

  handleMethodUpdate = (e) => {
    this.setState({ method: e.target.value }, this.validateInput);
  };

  handleHttpHeaderUpdate = (e) => {
    let index, input;
    [index, input] = e.target.name.split("-");

    const updatedEntry = Object.assign({}, this.state.headers[index], {
      [input]: e.target.value,
    });
    const newHeadersArray = this.state.headers;
    newHeadersArray[index] = updatedEntry;

    this.setState({ headers: newHeadersArray }, this.validateInput);
  };

  handleUrlParamUpdate = (e) => {
    let index, input;
    [index, input] = e.target.name.split("-");

    const updatedEntry = Object.assign({}, this.state.url_params[index], {
      [input]: e.target.value,
    });
    const newParamsArray = this.state.url_params;
    newParamsArray[index] = updatedEntry;

    let validUrlParam = true;
    validUrlParam = checkBracketClose(
      validUrlParam,
      updatedEntry.key,
      "{{",
      "}}"
    );
    validUrlParam = checkBracketClose(
      validUrlParam,
      updatedEntry.value,
      "{{",
      "}}"
    );
    validUrlParam = checkBracketClose(
      validUrlParam,
      updatedEntry.key,
      "{{{",
      "}}}"
    );
    validUrlParam = checkBracketClose(
      validUrlParam,
      updatedEntry.value,
      "{{{",
      "}}}"
    );
    validUrlParam = checkNoSingleBracket(validUrlParam, updatedEntry.key, "{");
    validUrlParam = checkNoSingleBracket(
      validUrlParam,
      updatedEntry.value,
      "{"
    );
    validUrlParam = checkNoSingleBracket(validUrlParam, updatedEntry.key, "}");
    validUrlParam = checkNoSingleBracket(
      validUrlParam,
      updatedEntry.value,
      "}"
    );

    this.setState({ url_params: newParamsArray, validUrlParam }, () =>
      this.validateInput(validUrlParam)
    );
  };

  validateInput = (validInput) => {
    const { method, endpoint, headers, url_params } = this.state;
    if (method.length > 0 && endpoint.length > 0) {
      const parsedHeaders = headers.reduce((a, h) => {
        if (h.header !== "" && h.value !== "") a[h.header] = h.value;
        return a;
      }, {});

      const parsedUrlParams = url_params.reduce((a, h) => {
        if (h.key !== "" && h.value !== "") a[h.key] = h.value;
        return a;
      }, {});

      this.props.onValidInput(
        {
          method,
          endpoint,
          headers: parsedHeaders,
          url_params: parsedUrlParams,
        },
        validInput
      );
    }
  };

  render() {
    const METHOD_TYPES = [
      { label: "POST", value: "post" },
      { label: "GET", value: "get" },
      { label: "PUT", value: "put" },
      { label: "PATCH", value: "patch" },
    ];

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col sm={12}>
            <Radio.Group
              defaultValue="post"
              onChange={this.handleMethodUpdate}
              value={this.state.method}
              buttonStyle="solid"
              style={{ paddingTop: "10px" }}
            >
              {METHOD_TYPES.map((method) => (
                <Radio.Button
                  key={`radio_${method.value}`}
                  value={method.value}
                >
                  {method.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Col>
          <Col sm={12}>
            <Text strong style={{ marginTop: "50px" }}>
              Endpoint URL (Required)
            </Text>
            <br />
            <Input
              placeholder="Endpoint URL"
              name="endpoint"
              value={this.state.endpoint}
              onChange={this.handleInputUpdate}
              style={{ width: "100%" }}
              suffix={
                <Tooltip title="The URL should start with either 'http://' or 'https://' and contain no spaces">
                  <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                </Tooltip>
              }
            />
            {!this.state.validEndpoint && (
              <Text style={{ color: "#F5222D", marginTop: 8 }}>
                {"Endpoint URL should not have spaces or {} brackets"}
              </Text>
            )}
          </Col>
        </Row>
        <div
          style={{ background: "#E6F7FF", borderRadius: "10px", padding: 20 }}
        >
          <Text strong>HTTP Headers (Optional)</Text>
          <br />
          {this.state.headers.map((obj, i) => (
            <Row gutter={16} style={{ marginBottom: 16 }} key={`${i}-key`}>
              <Col sm={12}>
                <Input
                  placeholder="Key"
                  name={`${i}-header`}
                  value={obj.header}
                  onChange={this.handleHttpHeaderUpdate}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col sm={12}>
                <Input
                  placeholder="Value"
                  name={`${i}-value`}
                  value={obj.value}
                  onChange={this.handleHttpHeaderUpdate}
                  style={{ width: "100%" }}
                />
              </Col>
            </Row>
          ))}
          <Row>
            <Button
              style={{
                borderColor: "#40A9FF",
                background: "none",
                color: "#096DD9",
              }}
              icon={<PlusOutlined />}
              type="default"
              onClick={this.addHeaderRow}
            >
              Add Header
            </Button>
          </Row>
        </div>

        <div
          style={{
            background: "#E6F7FF",
            borderRadius: "10px",
            padding: 20,
            marginTop: 10,
          }}
        >
          <Text strong>
            URL Params (Optional usage for payload interpolation)
          </Text>
          <br />
          {this.state.url_params.map((obj, i) => (
            <Row gutter={16} style={{ marginBottom: 16 }} key={`${i}-key`}>
              <Col sm={12}>
                <Input
                  placeholder="Key"
                  name={`${i}-key`}
                  value={obj.key}
                  onChange={this.handleUrlParamUpdate}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col sm={12}>
                <Input
                  placeholder="Value"
                  name={`${i}-value`}
                  value={obj.value}
                  onChange={this.handleUrlParamUpdate}
                  style={{ width: "100%" }}
                />
              </Col>
            </Row>
          ))}
          {!this.state.validUrlParam && (
            <Text style={{ color: "#F5222D" }}>
              {
                "For valid interpolation, URL params must use {{ or {{{ and have corresponding closing }} or }}}"
              }
            </Text>
          )}
          <Row>
            <Button
              style={{
                borderColor: "#40A9FF",
                background: "none",
                color: "#096DD9",
              }}
              icon={<PlusOutlined />}
              type="default"
              onClick={this.addUrlParamRow}
            >
              Add Param
            </Button>
          </Row>
        </div>
      </div>
    );
  }
}

const checkBracketClose = (validUrlParam, text, openBracket, closeBracket) => {
  if (
    text.indexOf(openBracket) !== -1 &&
    text.indexOf(closeBracket) <
      text.indexOf(openBracket) + openBracket.length + 1
  )
    return false;
  if (text.indexOf(openBracket) === -1 && text.indexOf(closeBracket) !== -1)
    return false;
  return validUrlParam;
};

const checkNoSingleBracket = (validUrlParam, text, bracket) => {
  if (text.indexOf(bracket) !== -1 && text.indexOf(bracket + bracket) === -1)
    return false;
  return validUrlParam;
};

export default HTTPForm;
