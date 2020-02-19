import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import debounce from 'lodash/debounce'
import gql from 'graphql-tag';
import omit from 'lodash/omit'
import { ALL_LABELS_DEVICES } from '../../graphql/labels'
import { Modal, Button, Checkbox, Input, Card, Icon, AutoComplete } from 'antd';
import LabelAddDeviceSelect from './LabelAddDeviceSelect'
import LabelAddLabelSelect from './LabelAddLabelSelect'

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

  checkAllDevices(search) {
    const { checkedDevices } = this.state
    if (Object.keys(checkedDevices).length > 0) {
      this.setState({ checkedDevices: {} })
    } else if (search.length > 0) {
      const devices = {}
      search.forEach(d => {
        devices[d.id] = true
      })
      this.setState({ checkedDevices: devices })
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

  checkAllLabels(search) {
    const { checkedLabels } = this.state
    if (Object.keys(checkedLabels).length > 0) {
      this.setState({ checkedLabels: {} })
    } else if (search.length > 0) {
      const labels = {}
      search.forEach(l => {
        if (this.props.label.id !== l.id) labels[l.id] = true
      })
      this.setState({ checkedLabels: labels })
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
              <LabelAddDeviceSelect
                checkAllDevices={this.checkAllDevices}
                allDevices={data.allDevices}
                checkedDevices={checkedDevices}
                checkSingleDevice={this.checkSingleDevice}
                labelNormalizedDevices={labelNormalizedDevices}
              />

              <LabelAddLabelSelect
                checkAllLabels={this.checkAllLabels}
                allLabels={data.allLabels}
                checkedLabels={checkedLabels}
                checkSingleLabel={this.checkSingleLabel}
                currentLabel={label}
              />
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

const ModalWithData = graphql(ALL_LABELS_DEVICES, queryOptions)(LabelAddDeviceModal)

export default ModalWithData
