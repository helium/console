import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { SEARCH_LABELS } from '../../graphql/search'
import { Typography, Button, Select } from 'antd';
const { Option } = Select
const { Text } = Typography
import debounce from 'lodash/debounce'
import find from 'lodash/find'
import UserCan from '../common/UserCan'
import LabelTag from '../common/LabelTag'

class LabelsAppliedSearch extends Component {
  state = {
    searchLabels: [],
    selectedLabel: undefined,
  }

  runSearch = (value) => {
    const { loading, refetch } = this.props.searchLabelsQuery

    this.setState({ selectedLabel: value}, () => {
      if (!loading) {
        refetch({ query: value })
        .then(({data}) => {
          const { searchLabels } = data

          const labels = []
          searchLabels.forEach(l => {
            const result = find(this.props.allLabels, { id: l.id })
            if (result) labels.push(result)
          })

          this.setState({ searchLabels: labels })
        })
      }
    })
  }

  render() {
    const { searchLabels, selectedLabel } = this.state
    const debouncedSearch = debounce(this.runSearch, 300)

    return (
      <div style={{ paddingRight: 17, borderRight: '1px solid #D9D9D9', marginRight: 30 }}>
        <Text style={{marginBottom: 6, display:'block'}}>Add a Label</Text>
        <Select
          showSearch
          placeholder="Search or Add Label..."
          onSearch={text => debouncedSearch(text)}
          onSelect={label_id => this.setState({ selectedLabel: label_id })}
          style={{ width: 300, marginBottom: 10 }}
          showArrow={false}
          filterOption={false}
          defaultActiveFirstOption={false}
          notFoundContent={null}
          autoClearSearchValue
          value={selectedLabel}
        >
          {searchLabels.map(l => (
            <Option value={l.id} key={l.id}>
              <LabelTag text={l.name} color={l.color} hasIntegrations={l.channels.length > 0} hasFunction={find(this.props.allLabels, { id: l.id }).function}/>
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

export default withGql(LabelsAppliedSearch, SEARCH_LABELS, props => ({ fetchPolicy: 'network-only', variables: { query:"" }, name: 'searchLabelsQuery' }))
