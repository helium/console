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

  render() {
    const { searchLabels } = this.state

    return(
      <AutoComplete
        style={{ width: 300, marginBottom: 10 }}
        options={searchLabels.map(l => (
          {
            label: (
              <LabelTag
                text={l.name}
              />
            ),
            value: l.name
          }
        ))}
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
