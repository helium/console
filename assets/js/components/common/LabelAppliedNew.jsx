import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { SEARCH_LABELS } from '../../graphql/search'
import { AutoComplete } from 'antd';
import find from 'lodash/find'
import LabelTag from './LabelTag'
class LabelAppliedNew extends Component {
  state = {
    searchLabels: []
  }

  runSearch = (value) => {
    const { loading, refetch } = this.props.searchLabelsQuery

    this.props.select(value);
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
  }

  generateOptions = () => {
    const { searchLabels } = this.state
    const { allLabels } = this.props

    if (allLabels && searchLabels.length == 0) {
      return allLabels.map(l => (
        {
          label: (
            <LabelTag
              text={l.name}
            />
          ),
          value: l.name
        }
      ))
    }
    if (searchLabels.length > 0) {
      return searchLabels.map(l => (
        {
          label: (
            <LabelTag
              text={l.name}
            />
          ),
          value: l.name
        }
      ))
    }
    return searchLabels
  }

  render() {
    return(
      <AutoComplete
        style={{ width: 250, marginBottom: 10 }}
        options={this.generateOptions()}
        onSelect={label_name => {
          this.props.select(label_name)
        }}
        placeholder="Search or Add Label..."
        value={this.props.value}
        onSearch={text => this.runSearch(text)}
      />
    );
  }
}

export default withGql(LabelAppliedNew, SEARCH_LABELS, props => ({ fetchPolicy: 'network-only', variables: { query:"" }, name: 'searchLabelsQuery' }))
