import React from 'react';
import { Typography, Input, Button, Form } from 'antd';
const { Text } = Typography
import { Card } from 'antd';


const ChannelNameForm = (props) => (
  <div>
    <Card title="Step 3 - Name your Integration">

    <Form onSubmit={props.onSubmit}>
      <Form.Item>
        <Input
          placeholder="Integration Name"
          name="channelName"
          value={props.channelName}
          onChange={props.onInputUpdate}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
      >
        Create Integration
      </Button>
    </Form>
    </Card>
  </div>
)

export default ChannelNameForm;
