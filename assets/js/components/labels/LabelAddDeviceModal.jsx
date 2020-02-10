import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import omit from 'lodash/omit'
import { LABELS_DEVICES } from '../../graphql/labels'
import { Modal, Button, Checkbox, Input, Card, Icon } from 'antd';
const { Search } = Input;

class LabelAddDeviceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedDevices: {},
      checkedLabels: {}
    }

    this.checkAllDevices = this.checkAllDevices.bind(this)
    this.checkAllLabels = this.checkAllLabels.bind(this)
    this.checkSingleDevice = this.checkSingleDevice.bind(this)
    this.checkSingleLabel = this.checkSingleLabel.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit() {
    const { checkedDevices, checkedLabels } = this.state

    this.props.addDevicesToLabels(checkedDevices, checkedLabels, this.props.label.id)

    this.props.onClose()
  }

  checkAllDevices() {
    const { checkedDevices } = this.state
    if (Object.keys(checkedDevices).length > 0) {
      this.setState({ checkedDevices: {} })
    } else {
      const devices = {}
      this.props.data.allDevices.forEach(d => {
        devices[d.id] = true
      })
      this.setState({ checkedDevices: devices })
    }
  }

  checkSingleDevice(id) {
    const { checkedDevices } = this.state
    let devices
    if (checkedDevices[id]) {
      devices = omit(checkedDevices, id)
    } else {
      devices = Object.assign({}, checkedDevices, { [id]: true })
    }
    this.setState({ checkedDevices: devices })
  }

  checkAllLabels() {
    const { checkedLabels } = this.state
    if (Object.keys(checkedLabels).length > 0) {
      this.setState({ checkedLabels: {} })
    } else {
      const labels = {}
      this.props.data.allLabels.forEach(l => {
        if (this.props.label.id !== l.id) labels[l.id] = true
      })
      this.setState({ checkedLabels: labels })
    }
  }

  checkSingleLabel(id) {
    const { checkedLabels } = this.state
    let labels

    if (checkedLabels[id]) {
      labels = omit(checkedLabels, id)
    } else {
      labels = Object.assign({}, checkedLabels, { [id]: true })
    }
    this.setState({ checkedLabels: labels })
  }

  render() {
    const { open, onClose, data, label, labelNormalizedDevices } = this.props
    const { checkedDevices, checkedLabels } = this.state

    return (
      <Modal
        title="Which Devices do you want to add this Label to?"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            Add Label to Devices
          </Button>
        ]}
      >
        {
          !data.loading && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <Card title={<Checkbox onChange={this.checkAllDevices} checked={data.allDevices.length === Object.keys(checkedDevices).length}>Select All Devices</Checkbox>} size="small" style={{ height: 200 }}>
                <Search
                  placeholder="Search here"
                  onSearch={value => console.log(value)}
                  style={{ width: 200, marginBottom: 10 }}
                />
                <div style={{ overflow: 'scroll', height: 102 }}>
                  {
                    data.allDevices.map(d => (
                      <div style={{ marginTop: 5 }} key={d.id}>
                        <Checkbox onChange={() => this.checkSingleDevice(d.id)} checked={checkedDevices[d.id]}>{d.name}</Checkbox>
                        {
                          labelNormalizedDevices[d.id] && <Icon type="check-circle" theme="filled" style={{ color: "#4091F7" }} />
                        }
                      </div>
                    ))
                  }
                </div>
              </Card>

              <Card title={<Checkbox onChange={this.checkAllLabels} checked={data.allLabels.length === Object.keys(checkedLabels).length}>Select All Labels</Checkbox>} size="small" style={{ marginLeft: 10, height: 200, overflow: 'scroll' }}>
                <Search
                  placeholder="Search here"
                  onSearch={value => console.log(value)}
                  style={{ width: 200, marginBottom: 10 }}
                />
                {
                  data.allLabels.map(l => {
                    if (l.name === label.name) return
                    return (
                      <div style={{ marginTop: 5 }} key={l.id}>
                        <Checkbox onChange={() => this.checkSingleLabel(l.id)} checked={checkedLabels[l.id]}>{l.name}</Checkbox>
                      </div>
                    )
                  })
                }
              </Card>
            </div>
          )
        }
      </Modal>
    )
  }
}

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

const ModalWithData = graphql(LABELS_DEVICES, queryOptions)(LabelAddDeviceModal)

export default ModalWithData
