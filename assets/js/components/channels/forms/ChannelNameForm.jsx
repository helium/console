import React from 'react';
import { Typography, Input, Form, Button, Card } from 'antd';
const { Text } = Typography

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
      <div style={{ marginTop: 20 }}>
        <Button
          type="primary"
          htmlType="submit"
          onClick={props.handleStep3Submit}
          disabled={!props.validInput}
        >
          Add Integration
        </Button>
      </div>
    </Card>
  </div>
)

export default ChannelNameForm;
