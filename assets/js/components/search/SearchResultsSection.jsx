import React, { Component } from 'react'
import SearchResult from './SearchResult'
import { Typography } from 'antd';
const { Text } = Typography

class SearchResultsSection extends Component {
  render() {
    const { title, results, selectedResult, gotoResult } = this.props

    return (
      <div>
        <div style={{ padding: 15, background: 'rgb(246, 248, 250)' }}>
          <Text strong>{title}</Text>
        </div>
        {results.map(result =>
          <SearchResult
            key={result.id}
            result={result}
            selected={selectedResult && selectedResult.id === result.id}
            gotoResult={gotoResult}
          />
        )}
      </div>
    )
  }
}

export default SearchResultsSection
