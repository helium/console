import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import findIndex from 'lodash/findIndex'
import flatten from 'lodash/flatten'
import last from 'lodash/last'
import SearchResults from './SearchResults'
import searchPages from './pages'
import analyticsLogger from '../../util/analyticsLogger'
import { GENERAL_SEARCH } from '../../graphql/search'
import { SearchOutlined } from '@ant-design/icons';
import withGql from '../../graphql/withGql'
import _JSXStyle from "styled-jsx/style"

@withRouter
class SearchBar extends Component {
  state = {
    query: "",
    open: false,
    searchResults: [],
    pageResults: [],
    flatResults: [],
    selectedResult: null
  }

  searchBarInput = React.createRef()

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

  handleUpdateQuery = (e) => {
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
    const { fetchMore } = this.props.searchQuery

    fetchMore({
      variables: { query: newQuery }
    })
    .then(({ data }) => {
      const { searchResults } = data
      const { pageResults } = this.state
      const flatResults = searchResults.concat(pageResults)
      const selectedResult = flatResults[0]

      this.setState({
        searchResults,
        flatResults,
        selectedResult
      })
    })
  }

  handleFocus = (e) => {
    const { query } = this.state
    this.setState({
      open: query.length > 0
    })
  }

  handleClick = (e) => {
    const clickPath = e.composedPath().map(p => p.id)
    if (findIndex(clickPath, el => el === 'searchResults') > -1) return
    if (findIndex(clickPath, el => el === 'searchBar') > -1) return
    if (!this.state.open) return
    this.setState({
      open: false
    })
  }

  handleKeydown = (event) => {
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

  focusSearchBar = () => {
    this.searchBarInput.current.focus()
  }

  nextResult = () => {
    const { selectedResult, flatResults } = this.state
    const resultIndex = findIndex(flatResults, r => selectedResult && r.id === selectedResult.id)
    const result = flatResults[resultIndex + 1]
    this.setState({
      selectedResult: result
    })
  }

  previousResult = () => {
    const { selectedResult, flatResults } = this.state
    const resultIndex = findIndex(flatResults, r => selectedResult && r.id === selectedResult.id)
    const result = resultIndex >= 0 ? flatResults[resultIndex - 1] : last(flatResults)
    this.setState({
      selectedResult: result
    })
  }

  clearResults = () => {
    this.searchBarInput.current.blur()
    this.setState({
      query: "",
      open: false,
      selectedResult: null
    })
  }

  gotoResult = (result) => {
    analyticsLogger.logEvent("ACTION_SEARCH", { "query": this.state.query, "title": result.title })
    this.clearResults()
    this.props.history.push(result.url)
  }

  render() {
    const { query, open, selectedResult, pageResults, searchResults } = this.state

    return (
      <div style={{display: 'inline-block'}}>
        <div onClick={this.focusSearchBar} id="searchBar" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <SearchOutlined style={{ color: 'white', fontSize: 18 }} />
          <input
            ref={this.searchBarInput}
            value={query}
            onChange={this.handleUpdateQuery}
            placeholder="Search Console..."
          />
        </div>

        {open && <SearchResults
          searchResults={searchResults}
          pageResults={pageResults}
          selectedResult={selectedResult}
          gotoResult={this.gotoResult}
        /> }

            <style jsx>{`
              input::placeholder {
                color: #56769D;
                transiton: all .2s ease;
              }
              #searchBar {
                transiton: all .2s ease;
              }
            `}</style>
      </div>
    )
  }
}

export default withGql(SearchBar, GENERAL_SEARCH, props => ({ fetchPolicy: 'network-only', variables: { query: "" }, name: 'searchQuery' }))
