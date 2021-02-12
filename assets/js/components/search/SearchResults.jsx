import React, { Component } from 'react'
import ReactDOM from "react-dom"
import SearchResultsSection from './SearchResultsSection'
import sample from 'lodash/sample'

import { Typography } from 'antd';
const { Text } = Typography

const searchRoot = document.getElementById('search-root');

class SearchResults extends Component {
  constructor(props) {
    super(props)
    this.el = document.createElement('div')
  }

  componentDidMount() {
    searchRoot.appendChild(this.el)
  }

  componentWillUnmount() {
    searchRoot.removeChild(this.el)
  }

  render() {
    const { searchResults, selectedResult, pageResults, gotoResult } = this.props
    const pageResultsLength = pageResults ? pageResults.length : 0
    const searchResultsLength = searchResults ? searchResults.length : 0

    if ((pageResultsLength + searchResultsLength) > 0) {
      return ReactDOM.createPortal(
        <div style={{ backgroundColor: 'white', zIndex: 10, borderRadius: 6, background: 'white', boxShadow: 'rgb(16, 24, 38) 0px 9px 44px -14px' }} id="searchResults">
          {searchResultsLength > 0 &&
            <SearchResultsSection
              title="SEARCH RESULTS"
              results={searchResults}
              selectedResult={selectedResult}
              gotoResult={gotoResult}
            />
          }
          {pageResultsLength > 0 &&
            <SearchResultsSection
              title="PAGES"
              results={pageResults}
              selectedResult={selectedResult}
              gotoResult={gotoResult}
            />
          }
          <div style={{ padding: 15, background: '#e6ebf1', textAlign: 'center' }}>
            <Text strong>TIP: You can quickly use search by pressing the </Text><span style={{ padding: 2, paddingLeft: 5, borderRadius: 4, border:'.5px solid rgba(0, 0, 0, 1)', marginRight: 4, background: 'white', fontWeight: 'bold' }}> / </span><Text strong> key.</Text>
          </div>
        </div>,
        this.el
      )
    } else {
      return ReactDOM.createPortal(
        <div style={{ backgroundColor: 'white', borderRadius: 6, boxShadow: 'rgb(16, 24, 38) 0px 9px 44px -14px', textAlign: 'center'  }} id="searchResults">
          <div style={{ backgroundColor: 'white', padding: '10px 20px' }} className="result">
            <Text>
              No Results Found {reactionFace()}
            </Text>
          </div>
        </div>,
        this.el
      )
    }
  }
}

const reactionFace = () => (
  sample(["🧐", "😩", "😠", "😐", "🤨", "😢"])
)

export default SearchResults
