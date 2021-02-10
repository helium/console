import React, { Component } from 'react'
import { Typography, Button, Card, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

class LabelShowChannelsAttached extends Component {
  state = {
    selectedChannel: null
  }
  render() {
    const { channels } = this.props
    const { selectedChannel } = this.state

    return (
      <div>
        <Card title="Added Integrations">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ borderRight: "1px solid #e1e4e8", marginRight: 20, height: 75 }}>
              <Text style={{ display: 'block' }}>Add an Integration</Text>

              <Select
                value={selectedChannel}
                onChange={() => {}}
                style={{ width: 220 }}
              >
                <Option value="$5">500,000 DC or less remaining</Option>
              </Select>
              <Button style={{ marginLeft: 8, marginRight: 20 }}>
                Add
              </Button>
            </div>
            <div style={{ height: 75 }}>
              <Text style={{ display: 'block' }}>Attached Integrations</Text>
              {
                channels && channels.map(c => <Text key={c.id}>{c.name}</Text>)
              }
            </div>
          </div>
        </Card>
      </div>
    )
  }
}

export default LabelShowChannelsAttached
