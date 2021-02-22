import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { ALL_LABELS } from '../../graphql/labels'
import { Typography, Button } from 'antd';
const { Text } = Typography
import find from 'lodash/find'
import remove from 'lodash/remove'
import UserCan from './UserCan'
import LabelTag from './LabelTag'
import LabelsAppliedSearch from './LabelsAppliedSearch'
import FunctionMoveLabelModal from '../functions/FunctionMoveLabelModal'

class LabelsAppliedExisting extends Component {
  state = {
    showFunctionMoveLabelModal: false,
    labelBeingMoved: null,
  }

  addLabelToList = value => {
    const { allLabels } = this.props.allLabelsQuery
    const existingLabel = find(allLabels, { id: value }) || find(allLabels, { name: value })


    if (existingLabel && existingLabel.function) {
      if (existingLabel.function.id === this.props.current_function.id) return

      this.openFunctionMoveLabelModal(existingLabel)
    } else if (existingLabel) {
      this.confirmAddLabel(existingLabel)
    } else {
      return this.props.createLabelAttachFunction(value)
    }
  }

  confirmAddLabel = (label) => {
    return this.props.updateLabelFunction(label.id)
  }

  openFunctionMoveLabelModal = (labelBeingMoved) => {
    this.setState({ showFunctionMoveLabelModal: true, labelBeingMoved })
  }

  closeFunctionMoveLabelModal = () => {
    this.setState({ showFunctionMoveLabelModal: false })
  }

  render() {
    const { showFunctionMoveLabelModal, labelBeingMoved } = this.state
    const { allLabels, loading, error } = this.props.allLabelsQuery
    if (loading) return <div />
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelsAppliedSearch allLabels={allLabels} addLabelToList={this.addLabelToList} />

        <div>
          <Text>Attached Labels</Text><br />
          <div style={{ marginTop: 5 }}>
            {
              this.props.labels.map(l => (
                <UserCan
                  key={l.id}
                  alternate={<LabelTag text={l.name} color={l.color} hasIntegrations={l.channels.length > 0} hasFunction={l.function} />}
                >
                  <LabelTag
                    key={l.id}
                    text={l.name}
                    color={l.color}
                    closable
                    hasIntegrations={l.channels.length > 0}
                    hasFunction={l.function}
                    onClose={e => {
                      e.preventDefault()
                      this.props.openRemoveFunctionLabelModal(l)
                    }}
                  />
                </UserCan>
              ))
            }
          </div>
        </div>

        <FunctionMoveLabelModal
          open={showFunctionMoveLabelModal}
          onClose={this.closeFunctionMoveLabelModal}
          label={labelBeingMoved}
          confirmAddLabel={this.confirmAddLabel}
        />
      </div>
    )
  }
}

export default withGql(LabelsAppliedExisting, ALL_LABELS, props => ({ fetchPolicy: 'cache-first', variables: {}, name: 'allLabelsQuery' }))
