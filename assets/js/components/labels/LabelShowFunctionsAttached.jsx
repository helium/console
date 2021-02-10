import React, { Component } from 'react'
import { Typography, Button, Card, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

class LabelShowFunctionsAttached extends Component {
  state = {
    selectedFunction: null
  }
  render() {
    const { func } = this.props
    const { selectedFunction } = this.state

    return (
      <div>
        <Card title="Added Function (Only 1 Allowed)">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ borderRight: "1px solid #e1e4e8", marginRight: 20, height: 75 }}>
              <Text style={{ display: 'block' }}>Add a Function</Text>

              <Select
                value={selectedFunction}
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
              <Text style={{ display: 'block' }}>Attached Function</Text>
              <Text>{func && func.name}</Text>
            </div>
          </div>
        </Card>
      </div>
    )
  }
}

export default LabelShowFunctionsAttached
