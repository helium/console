import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { SEARCH_LABELS } from '../../graphql/search'
import { AutoComplete, Select } from 'antd';
const { Option } = Select;
import find from 'lodash/find'
import LabelTag from './LabelTag'
import debounce from 'lodash/debounce'

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(SEARCH_LABELS, queryOptions)
class LabelAppliedNew extends Component {
  state = {
    searchLabels: []
  }

  runSearch = (value) => {
    const { loading, fetchMore } = this.props.data

    console.log({value})
    this.props.select(value);
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
  }

  render() {
    const { searchLabels } = this.state
    console.log({searchLabels})
    // const debouncedSearch = debounce(this.runSearch, 300)

    return(
      // <Select
      //   showSearch
      //   placeholder="Search or Add Label..."
      //   onSearch={text => debouncedSearch(text)}
      //   onSelect={label_id => {
      //     console.log({label_id})
      //     this.props.select(label_id)
      //   }}
      //   style={{ width: 300, marginBottom: 10 }}
      //   showArrow={false}
      //   filterOption={false}
      //   defaultActiveFirstOption={false}
      //   notFoundContent={null}
      //   autoClearSearchValue
      //   value={this.props.value}
      // >
      //   {searchLabels.map(l => (
      //     <Option value={l.id} key={l.id}>
      //       <LabelTag text={l.name} color={l.color} hasIntegrations={l.channels.length > 0} hasFunction={find(this.props.allLabels, { id: l.id }).function}/>
      //     </Option>
      //   ))}
      // </Select>
      <AutoComplete
        style={{ width: 300, marginBottom: 10 }}
        options={searchLabels.map(l => (
          {label: l.name, value: l.id}
        ))}
        onSelect={label_id => {
          console.log({label_id})
          this.props.select(label_id)
        }}
        placeholder="Search or Add Label..."
        value={this.props.value}
        onSearch={text => this.runSearch(text)}
      />
    );
  }
}

export default LabelAppliedNew