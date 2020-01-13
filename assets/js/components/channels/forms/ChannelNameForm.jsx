import React from 'react';
import { Typography, Input, Button, Form } from 'antd';
const { Text } = Typography

const ChannelNameForm = (props) => (
  <div>
    <Text strong>
      Step 3
    </Text>
    <br />
    <Text>
      Name your Channel
    </Text>

    <Form onSubmit={props.onSubmit}>
      <Form.Item>
        <Input
          placeholder="Channel Name"
          name="channelName"
          value={props.channelName}
          onChange={props.onInputUpdate}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
      >
        Create Channel
      </Button>
    </Form>
  </div>
)

export default ChannelNameForm;
