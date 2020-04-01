import React, { Component } from 'react'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { Tag, Icon } from 'antd';

class DeviceShowLabelsAttached extends Component {
  handleRemoveLabel = label => {
    this.props.openDeviceRemoveLabelModal([label])
  }

  render() {
    const { labels, openDevicesAddLabelModal } = this.props

    return (
      <UserCan
        alternate={
          <div>
            {
              labels.map(l => (
                <LabelTag
                  key={l.id}
                  text={l.name}
                  color={l.color}
                  style={{ marginBottom: 3 }}
                  hasIntegrations={l.channels.length > 0}
                />
              ))
            }
          </div>
        }
      >
        <div>
          {
            labels.map(l => (
              <LabelTag
                key={l.id}
                text={l.name}
                color={l.color}
                style={{ marginBottom: 3 }}
                closable
                hasIntegrations={l.channels.length > 0}
                onClose={e => {
                  e.preventDefault()
                  this.handleRemoveLabel(l)
                }}
              />
            ))
          }
          <Tag size="small" onClick={openDevicesAddLabelModal}>
            + Add Label
          </Tag>
        </div>
      </UserCan>
    )
  }
}

export default DeviceShowLabelsAttached
