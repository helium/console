import React from "react";
import { Input, Form, Button, Card } from "antd";

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
            style={{ ...(props.mobile ? { width: "100%" } : { width: 300 }) }}
            suffix={`${props.channelName.length}/50`}
            maxLength={50}
          />
        </Form.Item>
      </Form>
      {!props.noSubmit && (
        <div style={{ marginTop: 20 }}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={props.submit}
            disabled={!props.validInput}
          >
            Add Integration
          </Button>
        </div>
      )}
    </Card>
  </div>
);

export default ChannelNameForm;
