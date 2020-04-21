import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { ALL_LABELS } from '../../graphql/labels'
import { Typography, Button } from 'antd';
const { Text } = Typography
import find from 'lodash/find'
import remove from 'lodash/remove'
import UserCan from './UserCan'
import LabelTag from './LabelTag'
import LabelsAppliedSearch from './LabelsAppliedSearch'

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(ALL_LABELS, queryOptions)
class LabelsAppliedExisting extends Component {
  addLabelToList = value => {
    const { allLabels } = this.props.data
    const existingLabel = find(allLabels, { id: value }) || find(allLabels, { name: value })
    
    if (existingLabel) {
      this.props.updateLabelFunction(existingLabel.id)
    }
  }

  removeLabelApplied = () => {
    e.preventDefault()
  }

  render() {
    const { allLabels, loading, error } = this.props.data
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
                  alternate={<LabelTag text={l.name} color={l.color} hasIntegrations={l.channels.length > 0} />}
                >
                  <LabelTag
                    key={l.id}
                    text={l.name}
                    color={l.color}
                    closable
                    hasIntegrations={l.channels.length > 0}
                    onClose={e => this.removeLabelApplied()}
                  />
                </UserCan>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}

export default LabelsAppliedExisting
