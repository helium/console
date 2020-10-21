import React, { Component } from 'react'
import { Modal, Button, Typography, Divider, Select, Icon } from 'antd';
const { Option } = Select
import find from 'lodash/find'
import { swapLabel } from '../../actions/label'
import { graphql } from 'react-apollo';
const { Text } = Typography
import analyticsLogger from '../../util/analyticsLogger'
import LabelTag from '../common/LabelTag'
import { ALL_LABELS } from '../../graphql/labels'
import AddIcon from '../../../img/channel-show-add-label-icon.png'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(ALL_LABELS, queryOptions)
class SwapLabelModal extends Component {
  state = {
    showConfirmSwap: false,
    destinationLabel: null,
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) this.props.data.refetch()
  }

  handleSubmit = (e) => {
    const { onClose, swapLabel, labelToSwap } = this.props
    e.preventDefault();

    if (this.state.showConfirmSwap) {
      swapLabel(labelToSwap[0].id, this.state.destinationLabel.id)

      onClose()
      setTimeout(() => this.setState({ showConfirmSwap: false, destinationLabel: null }), 500)

      analyticsLogger.logEvent("ACTION_SWAP_LABELS", {label_id: labelToSwap[0].id, destination_label_id: this.state.destinationLabel.id})
    } else {
      this.setState({ showConfirmSwap: true })
    }
  }

  handleBack = (e) => {
    const { onClose } = this.props
    e.preventDefault();

    if (this.state.showConfirmSwap) {
      this.setState({ showConfirmSwap: false, destinationLabel: null })
    } else {
      onClose()
    }
  }

  render() {
    const { open, onClose, labelToSwap } = this.props
    const { allLabels } = this.props.data
    const { showConfirmSwap, destinationLabel } = this.state

    return (
      <Modal
        title={"Swap Label"}
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={this.handleBack}>
            { showConfirmSwap ? "Back" : "Cancel"}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={this.handleSubmit}
            disabled={
              (showConfirmSwap && labelToSwap[0].devices.length == 0) || (!showConfirmSwap && !destinationLabel)
            }
          >
            { showConfirmSwap ? "Swap Label" : "Continue"}
          </Button>,
        ]}
      >
        {
          labelToSwap && labelToSwap[0] && !showConfirmSwap && (
            <div>
              <Text style={{ display: 'block' }}>This action will swap the following label with another of your choice:</Text>
              <LabelTag text={labelToSwap[0].name} color={labelToSwap[0].color} style={{ marginTop: 10 }} hasIntegrations={labelToSwap[0].channels.length > 0} hasFunction={labelToSwap[0].function}/>
              <Divider />
              <Text style={{ display: 'block' }}>Swap with:</Text>
              <Select
                onChange={labelId => this.setState({ destinationLabel: find(allLabels, l => l.id === labelId) })}
                placeholder="Choose Label..."
                style={{ width: '100%', marginTop: 10 }}
              >
                {allLabels.filter(l => l.id !== labelToSwap[0].id).map(l => (
                  <Option value={l.id} key={l.id}>
                    <LabelTag text={l.name} color={l.color} hasIntegrations={l.channels.length > 0} hasFunction={l.function}/>
                  </Option>
                ))}
              </Select>
            </div>
          )
        }
        {
          labelToSwap && labelToSwap[0] && showConfirmSwap && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              <div style={{ height: 24, width: 24, marginRight: 15 }}>
                <img src={AddIcon} style={{ height: 24, width: 24}} />
              </div>
              <div>
                <Text style={{ display: 'block' }} strong>Are you sure you want to swap Labels?</Text>
                <Text style={{ display: 'block', marginTop: 10 }}>This will impact {labelToSwap[0].devices.length} devices.</Text>
                <div style={{ padding: 15, backgroundColor: '#F5F5F5', borderRadius: 5, marginTop: 10, display: 'inline-flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <LabelTag text={labelToSwap[0].name} color={labelToSwap[0].color} hasIntegrations={labelToSwap[0].channels.length > 0} hasFunction={labelToSwap[0].function}/>
                  <Icon type="double-right" style={{ marginRight: 8 }} />
                  <LabelTag text={destinationLabel.name} color={destinationLabel.color} hasIntegrations={destinationLabel.channels.length > 0} hasFunction={destinationLabel.function}/>
                </div>
              </div>
            </div>
          )
        }
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ swapLabel }, dispatch)
}

export default SwapLabelModal
