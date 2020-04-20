import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { SEARCH_LABELS } from '../../graphql/search'
import { ALL_LABELS } from '../../graphql/labels'
import { Typography, Button, Select } from 'antd';
const { Option } = Select
const { Text } = Typography
import debounce from 'lodash/debounce'
import find from 'lodash/find'
import remove from 'lodash/remove'
import UserCan from '../common/UserCan'
import LabelTag from '../common/LabelTag'

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

const searchQueryOptions = {
  options: props => ({
    variables: {
      query: ""
    }
  })
}

@graphql(ALL_LABELS, queryOptions)
class LabelsApplied extends Component {
  state = {
    labelsApplied: [],
    newLabels: []
  }

  addLabelToList = value => {
    const { allLabels } = this.props.data
    const { labelsApplied, newLabels } = this.state

    const labelById = find(allLabels, { id: value })
    const labelByName = find(allLabels, { name: value })

    if (!labelById && !labelByName) {
      if (!find(newLabels, { id: value })) {
        this.setState({ newLabels: newLabels.concat({ id: value, name: value, channels: [] }) }, () => {
          this.props.handleLabelsUpdate({ labelsApplied, newLabels: this.state.newLabels })
        })
      }
      return
    }

    if ((labelById && find(labelsApplied, labelById)) || (labelByName && find(labelsApplied, labelByName))) return

    this.setState({ labelsApplied: labelsApplied.concat(labelById || labelByName) }, () => {
      this.props.handleLabelsUpdate({ labelsApplied: this.state.labelsApplied, newLabels })
    })
  }

  removeLabelApplied = (id, key, e) => {
    e.preventDefault()
    remove(this.state[key], l => l.id === id)
    this.setState({ [key]: this.state[key] })
  }

  render() {
    const { allLabels, loading, error } = this.props.data
    if (loading) return <div />
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <SearchLabelsSelect allLabels={allLabels} addLabelToList={this.addLabelToList} />

        <div>
          <Text>Attached Labels</Text><br />
          <div style={{ marginTop: 5 }}>
            {
              this.state.labelsApplied.map(l => (
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
                    onClose={e => this.removeLabelApplied(l.id, "labelsApplied", e)}
                  />
                </UserCan>
              ))
            }
            {
              this.state.newLabels.map(l => (
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
                    onClose={e => this.removeLabelApplied(l.id, "newLabels", e)}
                    isNew
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

@graphql(SEARCH_LABELS, searchQueryOptions)
class SearchLabelsSelect extends Component {
  state = {
    searchLabels: [],
    selectedLabel: undefined,
  }

  runSearch = (value) => {
    const { loading, fetchMore } = this.props.data

    this.setState({ selectedLabel: value}, () => {
      if (!loading) {
        fetchMore({
          variables: { query: value },
          updateQuery: (prev, { fetchMoreResult }) => {
            const { searchLabels } = fetchMoreResult

            const labels = []
            searchLabels.forEach(l => {
              const result = find(this.props.allLabels, { id: l.id })
              if (result) labels.push(result)
            })

            this.setState({ searchLabels: labels })
          }
        })
      }
    })
  }

  render() {
    const { searchLabels, selectedLabel } = this.state
    const debouncedSearch = debounce(this.runSearch, 300)

    return (
      <div style={{ paddingRight: 17, borderRight: '1px solid #D9D9D9', marginRight: 30 }}>
        <Text>Add a Label</Text><br/>
        <Select
          showSearch
          placeholder="Search or Create Label..."
          onSearch={text => debouncedSearch(text)}
          onSelect={label_id => this.setState({ selectedLabel: label_id })}
          style={{ width: 200, marginBottom: 10 }}
          showArrow={false}
          filterOption={false}
          defaultActiveFirstOption={false}
          notFoundContent={null}
          autoClearSearchValue
          value={selectedLabel}
        >
          {searchLabels.map(l => (
            <Option value={l.id} key={l.id}>
              <LabelTag text={l.name} color={l.color} hasIntegrations={l.channels.length > 0}/>
            </Option>
          ))}
        </Select>
        <UserCan>
          <Button style={{ marginLeft: 10 }} onClick={() => this.props.addLabelToList(selectedLabel)} disabled={!selectedLabel || selectedLabel.length === 0}>
            Add
          </Button>
        </UserCan>
      </div>
    )
  }
}

export default LabelsApplied
