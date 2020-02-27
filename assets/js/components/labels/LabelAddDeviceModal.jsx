import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import debounce from 'lodash/debounce'
import omit from 'lodash/omit'
import analyticsLogger from '../../util/analyticsLogger'
import { ALL_LABELS_DEVICES } from '../../graphql/labels'
import { Modal, Button, Checkbox, Input, Card, Icon, AutoComplete, Typography } from 'antd';
import LabelAddDeviceSelect from './LabelAddDeviceSelect'
import LabelAddLabelSelect from './LabelAddLabelSelect'
const { Text } = Typography

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(ALL_LABELS_DEVICES, queryOptions)
class LabelAddDeviceModal extends Component {
  state = {
    checkedDevices: {},
    checkedLabels: {}
  }

  handleSubmit = () => {
    const { checkedDevices, checkedLabels } = this.state

    this.props.addDevicesToLabels(checkedDevices, checkedLabels, this.props.label.id)
    analyticsLogger.logEvent(
      "ACTION_ADD_DEVICES_AND_LABELS_TO_LABEL",
      {
        id: this.props.label.id,
        devices: Object.keys(checkedDevices),
        labels: Object.keys(checkedLabels),
      }
    )
    this.props.onClose()
  }

  checkAllDevices = (search) => {
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

  checkSingleDevice = (id) => {
    const { checkedDevices } = this.state
    let devices
    if (checkedDevices[id]) {
      devices = omit(checkedDevices, id)
    } else {
      devices = Object.assign({}, checkedDevices, { [id]: true })
    }
    this.setState({ checkedDevices: devices })
  }

  checkAllLabels = (search) => {
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

  checkSingleLabel = (id) => {
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
    const { open, onClose, label, labelNormalizedDevices } = this.props
    const { allDevices, allLabels, loading, error } = this.props.data
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
          !loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <LabelAddDeviceSelect
                checkAllDevices={this.checkAllDevices}
                allDevices={allDevices}
                checkedDevices={checkedDevices}
                checkSingleDevice={this.checkSingleDevice}
                labelNormalizedDevices={labelNormalizedDevices}
              />

              <LabelAddLabelSelect
                checkAllLabels={this.checkAllLabels}
                allLabels={allLabels}
                checkedLabels={checkedLabels}
                checkSingleLabel={this.checkSingleLabel}
                currentLabel={label}
              />
            </div>
          )
        }
        {
          error && <Text>Data failed to load, please reload the page and try again</Text>
        }
      </Modal>
    )
  }
}

export default LabelAddDeviceModal
