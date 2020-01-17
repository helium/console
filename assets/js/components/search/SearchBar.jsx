import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import findIndex from 'lodash/findIndex'
import flatten from 'lodash/flatten'
import last from 'lodash/last'
import SearchResults from './SearchResults'
import searchPages from './pages'
import analyticsLogger from '../../util/analyticsLogger'
import { Icon } from 'antd'

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const queryOptions = {
  options: props => ({
    variables: {
      query: ""
    }
  })
}

const query = gql`
  query SearchQuery ($query: String) {
    searchResults(query: $query) {
      id,
      title,
      description,
      category,
      score,
      url
    }
  }
`

@withRouter
@graphql(query, queryOptions)
class SearchBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: "",
      open: false,
      searchResults: [],
      pageResults: [],
      flatResults: [],
      selectedResult: null
    }

    this.searchBarInput = React.createRef()
    this.handleUpdateQuery = this.handleUpdateQuery.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.focusSearchBar = this.focusSearchBar.bind(this)
    this.nextResult = this.nextResult.bind(this)
    this.previousResult = this.previousResult.bind(this)
    this.clearResults = this.clearResults.bind(this)
    this.gotoResult = this.gotoResult.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown)
    this.searchBarInput.current.addEventListener('focus', this.handleFocus)
    window.addEventListener('click', this.handleClick)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
    this.searchBarInput.current.removeEventListener('focus', this.handleFocus)
    window.removeEventListener('click', this.handleClick)
  }

  handleUpdateQuery(e) {
    // Update query state first
    const newQuery = e.target.value

    this.setState({
      query: newQuery,
      open: newQuery.length > 0
    })

    // update page results state
    const { searchResults } = this.state
    const pageResults = searchPages(newQuery)
    const flatResults = searchResults.concat(pageResults)
    const selectedResult = flatResults[0]

    this.setState({
      pageResults,
      flatResults,
      selectedResult
    })

    // fire off graphql query to get searchResults
    const { fetchMore } = this.props.data

    fetchMore({
      variables: { query: newQuery },
      updateQuery: (prev, { fetchMoreResult }) => {
        // update searchResults state
        const { searchResults } = fetchMoreResult
        const { pageResults } = this.state
        const flatResults = searchResults.concat(pageResults)
        const selectedResult = flatResults[0]

        this.setState({
          searchResults,
          flatResults,
          selectedResult
        })

        return fetchMoreResult
      }
    })
  }

  handleFocus(e) {
    const { query } = this.state
    this.setState({
      open: query.length > 0
    })
  }

  handleClick(e) {
    const clickPath = e.composedPath().map(p => p.id)
    if (findIndex(clickPath, el => el === 'searchResults') > -1) return
    if (findIndex(clickPath, el => el === 'searchBar') > -1) return
    if (!this.state.open) return
    this.setState({
      open: false
    })
  }

  handleKeydown(event) {
    if (this.state.open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault()
        this.nextResult()
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault()
        this.previousResult()
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        this.gotoResult(this.state.selectedResult)
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        this.clearResults()
      }
    }

    // Disable the following keyboard shortcuts when the user is typing
    if (document.activeElement.tagName === "INPUT") return
    if (document.activeElement.tagName === "TEXTAREA") return

    if (event.key === '/') {
      event.preventDefault()
      this.focusSearchBar()
    }
  }

  focusSearchBar() {
    this.searchBarInput.current.focus()
  }

  nextResult() {
    const { selectedResult, flatResults } = this.state
    const resultIndex = findIndex(flatResults, r => selectedResult && r.id === selectedResult.id)
    const result = flatResults[resultIndex + 1]
    this.setState({
      selectedResult: result
    })
  }

  previousResult() {
    const { selectedResult, flatResults } = this.state
    const resultIndex = findIndex(flatResults, r => selectedResult && r.id === selectedResult.id)
    const result = resultIndex >= 0 ? flatResults[resultIndex - 1] : last(flatResults)
    this.setState({
      selectedResult: result
    })
  }

  clearResults() {
    this.searchBarInput.current.blur()
    this.setState({
      query: "",
      open: false,
      selectedResult: null
    })
  }

  gotoResult(result) {
    analyticsLogger.logEvent("ACTION_SEARCH", { "query": this.state.query, "title": result.title })
    this.clearResults()
    this.props.history.push(result.url)
  }

  render() {
    const { query, open, selectedResult, pageResults } = this.state
    const { searchResults } = this.props.data

    return (
      <div>
        <div onClick={this.focusSearchBar} id="searchBar" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Icon type="search" style={{ color: 'white', fontSize: 18 }} />
          <input
            ref={this.searchBarInput}
            value={query}
            onChange={this.handleUpdateQuery}
            placeholder="Search..."
          />
        </div>

        {open && <SearchResults
          searchResults={searchResults}
          pageResults={pageResults}
          selectedResult={selectedResult}
          gotoResult={this.gotoResult}
        /> }
      </div>
    )
  }
}

export default SearchBar
