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
        <div style={{ backgroundColor: 'white', zIndex: 10 }} id="searchResults">
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
        </div>,
        this.el
      )
    } else {
      return ReactDOM.createPortal(
        <div style={{ backgroundColor: 'white', paddingLeft: 20, paddingTop: 10, paddingBottom: 10 }} id="searchResults">
          <Text>
            No Results Found {reactionFace()}
          </Text>
        </div>,
        this.el
      )
    }
  }
}

const reactionFace = () => (
  sample([":(", ":'(", ":c", ":{", ":[", ">:("])
)

export default SearchResults
