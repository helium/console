import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import findIndex from 'lodash/findIndex'
import flatten from 'lodash/flatten'
import last from 'lodash/last'
import SearchResults from './SearchResults'
import searchPages from './pages'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// Icons
import SearchIcon from '@material-ui/icons/Search'

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

    this.container = null
    this.searchBarInput = React.createRef()
    this.handleUpdateQuery = this.handleUpdateQuery.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.focusSearchBar = this.focusSearchBar.bind(this)
    this.nextResult = this.nextResult.bind(this)
    this.previousResult = this.previousResult.bind(this)
    this.clearResults = this.clearResults.bind(this)
    this.gotoSelecetedResult = this.gotoSelectedResult.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
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
    const flatResults = pageResults.concat(searchResults)
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
        const flatResults = pageResults.concat(searchResults)
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
        this.gotoSelectedResult()
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

  gotoSelectedResult() {
    const { selectedResult } = this.state
    this.clearResults()
    this.props.history.replace(selectedResult.url)
  }

  render() {
    const { query, open, selectedResult, pageResults } = this.state
    const { searchResults } = this.props.data

    return (
      <div>
        <div onClick={this.focusSearchBar} id="searchBar">
          <SearchIcon />
          <input
            ref={this.searchBarInput}
            value={query}
            onChange={this.handleUpdateQuery}
          />
        </div>

        {open && <SearchResults
          searchResults={searchResults}
          pageResults={pageResults}
          selectedResult={selectedResult}
        /> }
      </div>
    )
  }
}

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

const SearchBarWithData = graphql(query, queryOptions)(SearchBar)

export default withRouter(SearchBarWithData)
