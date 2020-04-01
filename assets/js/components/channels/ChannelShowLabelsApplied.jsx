import React from 'react'
import { Typography, Button, Card, Select } from 'antd';
const { Text, Paragraph } = Typography
const { Option } = Select
import find from 'lodash/find'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'

const ChannelShowLabelsApplied = ({ handleClickAdd, handleClickRemove, handleSelectLabel, allLabels, channel }) => (
  <Card title="Labels Applied to">
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <UserCan>
        <div style={{ paddingRight: 17, borderRight: '1px solid #D9D9D9', marginRight: 30 }}>
          <Text strong>Add a Label</Text><br/>
          <Select
            onChange={handleSelectLabel}
            style={{ width: 220 }}
            placeholder="Choose Label..."
          >
            {allLabels.map(l => (
              <Option value={l.id} key={l.id}>
                <LabelTag text={l.name} color={l.color} hasIntegrations={l.channels.length > 0}/>
              </Option>
            ))}
          </Select>
          <Button style={{ marginLeft: 10 }} onClick={handleClickAdd}>
            Add
          </Button>
        </div>
      </UserCan>

      <div>
        <Text strong>Attached Labels</Text><br />
        <div style={{ marginTop: 5 }}>
          {
            channel.labels.map(l => (
              <UserCan
                key={l.id}
                alternate={<LabelTag text={l.name} color={l.color} hasIntegrations={find(allLabels, { id: l.id }).channels.length > 0}/>}
              >
                <LabelTag
                  key={l.id}
                  text={l.name}
                  color={l.color}
                  closable
                  hasIntegrations={find(allLabels, { id: l.id }).channels.length > 0}
                  onClose={e => {
                    e.preventDefault()
                    handleClickRemove(l.id)
                  }}
                />
              </UserCan>
            ))
          }
        </div>
      </div>
    </div>
  </Card>
)

export default ChannelShowLabelsApplied
