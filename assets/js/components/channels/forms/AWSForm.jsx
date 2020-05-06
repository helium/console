import React, { Component } from 'react';
import { Typography, Input } from 'antd';
const { Text, Title } = Typography

class AWSForm extends Component {
  state = {
    accessKey: "",
    secretKey: "",
    region: "",
    topic: "",
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const {accessKey, secretKey, region, topic } = this.state
      if (accessKey.length > 0 && secretKey.length > 0 && region.length > 0 && topic.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          aws_access_key: accessKey,
          aws_secret_key: secretKey,
          aws_region: region,
          topic
        })
      }
    })
  }

  render() {
    const { type } = this.props

    return(
      <div>
        <Text>
          {type === "update" ? "Update your AWS Connection Details" : "Enter your AWS Connection Details"}
        </Text>

        <div style={{ marginTop: '20px'}}>
          <Input
            addonBefore={(<div style={{width: '125px', textAlign: 'left'}}>Access Key</div>)}
            placeholder="ie. AKIATFHY24442Z62QSQW"
            name="accessKey"
            value={this.state.accessKey}
            onChange={this.handleInputUpdate}
            style={{ marginBottom: '10px', width: '350px'}}
          />
          <br />
          <Input
            addonBefore={(<div style={{width: '125px', textAlign: 'left'}}>Secret Key</div>)}
            placeholder="ie. /bqKQzh8QbSuxrZJJGVX/KST5ZBGQW0kblIO4qJ4"
            name="secretKey"
            value={this.state.secretKey}
            onChange={this.handleInputUpdate}
            style={{ marginBottom: '10px', width: '475px'}}
          />
          <br />
          <Input
            addonBefore={(<div style={{width: '125px', textAlign: 'left'}}>Region</div>)}
            placeholder="ie. us-west-1"
            name="region"
            value={this.state.region}
            onChange={this.handleInputUpdate}
            style={{ marginBottom: '10px', width: '350px'}}
          />
          <br />
          <Input
            addonBefore={(<div style={{width: '125px', textAlign: 'left'}}>Topic</div>)}
            placeholder="ie. my topic"
            name="topic"
            value={this.state.topic}
            onChange={this.handleInputUpdate}
            style={{ marginBottom: '10px', width: '350px'}}
          />
        </div>
      </div>
    );
  }
}

export default AWSForm;
