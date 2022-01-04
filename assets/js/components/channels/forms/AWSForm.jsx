import React, { Component } from "react";
import { Typography, Input } from "antd";
const { Text } = Typography;

class AWSForm extends Component {
  state = {
    accessKey: "",
    secretKey: "",
    region: "",
    topic: "",
  };

  componentDidMount() {
    const { channel } = this.props;

    if (channel && channel.topic) {
      this.setState({
        accessKey: channel.aws_access_key,
        secretKey: "",
        region: channel.aws_region,
        topic: channel.topic,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.channel &&
      prevProps.channel.topic &&
      this.props.channel &&
      this.props.channel.topic &&
      prevProps.channel.topic +
        prevProps.channel.aws_access_key +
        prevProps.channel.aws_region !=
        this.props.channel.topic +
          this.props.channel.aws_access_key +
          this.props.channel.aws_region
    ) {
      this.setState({
        accessKey: this.props.channel.aws_access_key,
        secretKey: "",
        region: this.props.channel.aws_region,
        topic: this.props.channel.topic,
      });
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { accessKey, secretKey, region, topic } = this.state;
      if (
        accessKey.length > 0 &&
        secretKey.length > 0 &&
        region.length > 0 &&
        topic.length > 0
      ) {
        // check validation, if pass
        this.props.onValidInput({
          aws_access_key: accessKey,
          aws_secret_key: secretKey,
          aws_region: region,
          topic,
        });
      }
    });
  };

  render() {
    const { type } = this.props;

    return (
      <div>
        <Text>
          {type === "update"
            ? "Update your AWS Connection Details"
            : "Enter your AWS Connection Details"}
        </Text>

        <div style={{ marginTop: "20px" }}>
          <Input
            addonBefore={
              <div className={!this.props.mobile && "desktop-form"}>
                Access Key
              </div>
            }
            placeholder="ie. AKIATFHY24442Z62QSQW"
            name="accessKey"
            value={this.state.accessKey}
            onChange={this.handleInputUpdate}
            style={{
              marginBottom: "10px",
              width: this.props.mobile ? "100%" : "350px",
            }}
          />
          <br />
          <Input
            addonBefore={
              <div className={!this.props.mobile && "desktop-form"}>
                Secret Key
              </div>
            }
            placeholder="ie. /bqKQzh8QbSuxrZJJGVX/KST5ZBGQW0kblIO4qJ4"
            name="secretKey"
            value={this.state.secretKey}
            onChange={this.handleInputUpdate}
            style={{
              marginBottom: "10px",
              width: this.props.mobile ? "100%" : "475px",
            }}
          />
          <br />
          <Input
            addonBefore={
              <div className={!this.props.mobile && "desktop-form"}>Region</div>
            }
            placeholder="ie. us-west-1"
            name="region"
            value={this.state.region}
            onChange={this.handleInputUpdate}
            style={{
              marginBottom: "10px",
              width: this.props.mobile ? "100%" : "350px",
            }}
          />
          <br />
          <Input
            addonBefore={
              <div className={!this.props.mobile && "desktop-form"}>Topic</div>
            }
            placeholder="ie. my topic"
            name="topic"
            value={this.state.topic}
            onChange={this.handleInputUpdate}
            style={{
              marginBottom: "10px",
              width: this.props.mobile ? "100%" : "350px",
            }}
          />
        </div>
      </div>
    );
  }
}

export default AWSForm;
