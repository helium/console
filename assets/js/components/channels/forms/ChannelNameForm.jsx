import React from 'react';
import { Typography, Input, Form } from 'antd';
const { Text } = Typography
import { Card } from 'antd';


const ChannelNameForm = (props) => (
  <div>
    <Card title="Step 3 - Name your Integration (Required)">
      <Form>
        <Form.Item>
          <Input
            placeholder="Integration Name"
            name="channelName"
            value={props.channelName}
            onChange={props.onInputUpdate}
            style={{ width: 220 }}
          />
        </Form.Item>
      </Form>
    </Card>
  </div>
)

export default ChannelNameForm;
