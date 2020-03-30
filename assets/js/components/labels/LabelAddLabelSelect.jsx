import React, { Component } from 'react'
import debounce from 'lodash/debounce'
import { Checkbox, Input, Card, Icon, AutoComplete } from 'antd';
import { graphql } from 'react-apollo';
import { SEARCH_LABELS } from '../../graphql/search'

const queryOptions = {
  options: props => ({
    variables: {
      query: ""
    }
  })
}

@graphql(SEARCH_LABELS, queryOptions)
class LabelAddLabelSelect extends Component {
  state = {
    searchLabels: []
  }

  runSearch = (value) => {
    const { loading, fetchMore } = this.props.data
    if (!loading) {
      fetchMore({
        variables: { query: value },
        updateQuery: (prev, { fetchMoreResult }) => {
          const { searchLabels } = fetchMoreResult

          this.setState({ searchLabels })
        }
      })
    }
  }

  render () {
    const {
      checkAllLabels,
      allLabels,
      checkedLabels,
      checkSingleLabel,
      currentLabel,
    } = this.props

    const { searchLabels } = this.state

    const debouncedSearch = debounce(this.runSearch, 300)

    return (
      <Card title={<Checkbox onChange={e => checkAllLabels(searchLabels)} checked={allLabels.length === Object.keys(checkedLabels).length}>Select All Labels</Checkbox>} size="small" style={{ marginLeft: 10, height: 200 }}>
        <Input
          placeholder="Search here"
          suffix={<Icon type="search" />}
          onChange={e => debouncedSearch(e.target.value)}
          style={{ width: 200, marginBottom: 10 }}
        />
        <div style={{ overflow: 'scroll', height: 102, width: 200 }}>
          {
            searchLabels.length === 0 && allLabels.map(l => {
              if (l.id === currentLabel.id) return
              return (
                <div style={{ marginTop: 5 }} key={l.id}>
                  <Checkbox onChange={() => checkSingleLabel(l.id)} checked={checkedLabels[l.id]}>{l.name}</Checkbox>
                </div>
              )
            })
          }
          {
            searchLabels.map(l => {
              if (l.id === currentLabel.id) return
              return (
                <div style={{ marginTop: 5 }} key={l.id}>
                  <Checkbox onChange={() => checkSingleLabel(l.id)} checked={checkedLabels[l.id]}>{l.name}</Checkbox>
                </div>
              )
            })
          }
        </div>
      </Card>
    )
  }
}

export default LabelAddLabelSelect
