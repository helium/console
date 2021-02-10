import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { SEARCH_LABELS } from '../../graphql/search'
import { AutoComplete } from 'antd';
import find from 'lodash/find'
import LabelTag from './LabelTag'

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
    variables: {
      query: ""
    }
  })
}

@graphql(SEARCH_LABELS, queryOptions)
class LabelAppliedNew extends Component {
  state = {
    searchLabels: []
  }

  runSearch = (value) => {
    const { loading, fetchMore } = this.props.data

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

    return(
      <AutoComplete
        style={{ width: 300, marginBottom: 10 }}
        options={searchLabels.map(l => (
          {
            label: (
              <LabelTag 
                text={l.name} 
                color={l.color} 
                hasIntegrations={l.channels.length > 0} 
                hasFunction={find(this.props.allLabels, { id: l.id }).function}
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

export default LabelAppliedNew