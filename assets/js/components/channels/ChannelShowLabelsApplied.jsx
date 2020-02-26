import React from 'react'
import { Typography, Button, Card, Select } from 'antd';
const { Text, Paragraph } = Typography
const { Option } = Select
import LabelTag from '../common/LabelTag'

const ChannelShowLabelsApplied = ({ handleClickAdd, handleClickRemove, handleSelectLabel, allLabels, channel }) => (
  <Card title="Labels Applied to">
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ paddingRight: 17 }}>
        <Text strong>Add a Label</Text><br/>
        <Select
          onChange={handleSelectLabel}
          style={{ width: 220 }}
          placeholder="Choose Label..."
        >
          {allLabels.map(l => (
            <Option value={l.id} key={l.id}>
              <LabelTag text={l.name} color={l.color} />
            </Option>
          ))}
        </Select>
        <Button style={{ marginLeft: 10 }} onClick={handleClickAdd}>
          Add
        </Button>
      </div>
      <div style={{ paddingLeft: 30, borderLeft: '1px solid #D9D9D9' }}>
        <Text strong>Attached Labels</Text><br />
        <div style={{ marginTop: 5 }}>
          {
            channel.labels.map(l => (
              <LabelTag key={l.id} text={l.name} color={l.color} closable onClose={e => {
                e.preventDefault()
                handleClickRemove(l.id)
              }}/>
            ))
          }
        </div>
      </div>
    </div>
  </Card>
)

export default ChannelShowLabelsApplied
